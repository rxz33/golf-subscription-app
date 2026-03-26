import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
)

export async function GET() {
  const { data, error } = await adminSupabase
    .from('winners')
    .select('*, profiles(email), draws(month, year)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Failed to fetch winners' }, { status: 500 })
  return NextResponse.json({ winners: data ?? [] })
}