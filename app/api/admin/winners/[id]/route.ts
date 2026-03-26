import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
)

const VALID_STATUSES = ['pending', 'verified', 'paid', 'rejected']

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { status } = await request.json()

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const { error } = await adminSupabase
    .from('winners')
    .update({ status })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: 'Failed to update winner' }, { status: 500 })
  return NextResponse.json({ success: true })
}