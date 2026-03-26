import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function makeSupabase(response: NextResponse) {
  const cookieStore = cookies()
  return createServerClient(
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
}

// Get all published draws
export async function GET() {
  const response = NextResponse.next()
  const supabase = makeSupabase(response)

  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'published')
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) {
    console.error('[GET /api/draws]', error)
    return NextResponse.json({ error: 'Failed to fetch draws' }, { status: 500 })
  }

  return NextResponse.json({ draws: data ?? [] })
}