import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { PRIZE_POOL_SPLIT } from '@/lib/utils'

const adminSupabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
)

async function getAdminUser(response: NextResponse) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return profile?.is_admin ? user : null
}

// Generate random winning numbers from 1-45
function generateWinningNumbers(): number[] {
  const numbers = new Set<number>()
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1)
  }
  return Array.from(numbers).sort((a, b) => a - b)
}

function countMatches(userNumbers: number[], winningNumbers: number[]): number {
  return userNumbers.filter(n => winningNumbers.includes(n)).length
}

// Run or simulate a draw
export async function POST(request: NextRequest) {
  const response = NextResponse.next()
  const admin = await getAdminUser(response)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { month, year, publish = false, jackpot_rollover = 0 } = await request.json()

  // Get active subscriber count for prize pool calculation
  const { count: subscriberCount } = await adminSupabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const totalPool = ((subscriberCount ?? 0) * 9.99 * 0.6) + jackpot_rollover

  const winningNumbers = generateWinningNumbers()

  // Get all user scores for this month to generate their draw numbers
  const { data: scores } = await adminSupabase
    .from('golf_scores')
    .select('user_id, score')
    .gte('played_at', `${year}-${String(month).padStart(2, '0')}-01`)
    .lt('played_at', `${year}-${String(month + 1).padStart(2, '0')}-01`)

  // Group scores by user and take last 5
  const userScoresMap: Record<string, number[]> = {}
  scores?.forEach(({ user_id, score }) => {
    if (!userScoresMap[user_id]) userScoresMap[user_id] = []
    userScoresMap[user_id].push(score)
  })

  // Calculate matches for each user
  const entries = Object.entries(userScoresMap).map(([user_id, userScores]) => {
    const numbers = userScores.slice(0, 5)
    const matchCount = countMatches(numbers, winningNumbers)
    return { user_id, numbers, match_count: matchCount }
  })

  const winners5 = entries.filter(e => e.match_count === 5)
  const winners4 = entries.filter(e => e.match_count === 4)
  const winners3 = entries.filter(e => e.match_count === 3)

  const jackpotRolledOver = winners5.length === 0
  const jackpotAmount = totalPool * PRIZE_POOL_SPLIT['5-match']

  const status = publish ? 'published' : 'simulated'

  // Upsert draw record
  const { data: draw, error: drawError } = await adminSupabase
    .from('draws')
    .upsert({
      month,
      year,
      status,
      winning_numbers: winningNumbers,
      total_prize_pool: totalPool,
      jackpot_amount: jackpotAmount,
      jackpot_rolled_over: jackpotRolledOver,
      published_at: publish ? new Date().toISOString() : null,
    }, { onConflict: 'month,year' })
    .select()
    .single()

  if (drawError) {
    console.error('[Admin Draw]', drawError)
    return NextResponse.json({ error: 'Failed to create draw' }, { status: 500 })
  }

  if (publish && draw) {
    // Insert draw entries
    const entryRows = entries.map(e => ({
      draw_id: draw.id,
      user_id: e.user_id,
      numbers: e.numbers,
      match_count: e.match_count,
    }))

    if (entryRows.length > 0) {
      await adminSupabase.from('draw_entries').upsert(entryRows, { onConflict: 'draw_id,user_id' })
    }

    // Insert winners
    const winnerRows = [
      ...winners5.map(w => ({ draw_id: draw.id, user_id: w.user_id, match_type: '5-match' as const, prize_amount: jackpotAmount / winners5.length })),
      ...winners4.map(w => ({ draw_id: draw.id, user_id: w.user_id, match_type: '4-match' as const, prize_amount: (totalPool * PRIZE_POOL_SPLIT['4-match']) / winners4.length })),
      ...winners3.map(w => ({ draw_id: draw.id, user_id: w.user_id, match_type: '3-match' as const, prize_amount: (totalPool * PRIZE_POOL_SPLIT['3-match']) / winners3.length })),
    ]

    if (winnerRows.length > 0) {
      await adminSupabase.from('winners').insert(winnerRows)
    }
  }

  return NextResponse.json({
    draw,
    simulation: {
      winning_numbers: winningNumbers,
      total_pool: totalPool,
      jackpot_rolled_over: jackpotRolledOver,
      winners: { '5-match': winners5.length, '4-match': winners4.length, '3-match': winners3.length },
    }
  })
}

// Get all draws (admin sees all statuses)
export async function GET() {
  const response = NextResponse.next()
  const admin = await getAdminUser(response)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await adminSupabase
    .from('draws')
    .select('*')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch draws' }, { status: 500 })

  return NextResponse.json({ draws: data ?? [] })
}