import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '../../_helpers'
import { notifyAdminRealtime } from '../../_realtime'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const { id } = await params
  const body = await req.json()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hero_slides')
    .update({
      badge: body.position,
      title: body.title,
      bg_gradient: body.image_url,
      href: body.href,
      sort_order: body.sort_order,
      is_active: body.is_active,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await notifyAdminRealtime({ scope: 'slides', action: 'updated' })
  return NextResponse.json({ slide: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const { id } = await params
  const supabase = await createClient()
  const { error } = await supabase.from('hero_slides').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await notifyAdminRealtime({ scope: 'slides', action: 'deleted' })
  return NextResponse.json({ success: true })
}
