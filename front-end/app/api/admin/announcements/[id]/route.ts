import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '../../_helpers'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const body = await req.json()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('announcements')
    .update({
      text: body.text,
      link: body.link ?? null,
      sort_order: body.sort_order,
      is_active: body.is_active,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ announcement: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const supabase = await createClient()
  const { error } = await supabase.from('announcements').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
