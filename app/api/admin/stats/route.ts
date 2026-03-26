import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { PLAN_PRICES } from '@/lib/utils'

const adminSupabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
)

export async function GET() {
  const response = NextResponse.next()
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
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [
    { count: total_users },
    { count: active_subscribers },
    { count: total_draws },
  ] = await Promise.all([
    adminSupabase.from('profiles').select('*', { count: 'exact', head: true }),
    adminSupabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    adminSupabase.from('draws').select('*', { count: 'exact', head: true }),
  ])

  const total_prize_pool = ((active_subscribers ?? 0) * PLAN_PRICES.monthly * 0.6)

  return NextResponse.json({
    stats: {
      total_users: total_users ?? 0,
      active_subscribers: active_subscribers ?? 0,
      total_prize_pool,
      total_draws: total_draws ?? 0,
    }
  })
}