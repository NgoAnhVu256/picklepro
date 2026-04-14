import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser, adminUnauthorized } from '../../_helpers'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUser()
  if (!admin) return adminUnauthorized()

  const body = await req.json()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hero_slides')
    .update({
      badge: body.badge,
      title: body.title,
      title_highlight: body.title_highlight,
      description: body.description,
      button_text: body.button_text,
      button_gradient: body.button_gradient,
      bg_gradient: body.bg_gradient,
      href: body.href,
      sort_order: body.sort_order,
      is_active: body.is_active,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ slide: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await getAdminUser()
  if (!admin) return adminUnauthorized()

  const supabase = await createClient()
  const { error } = await supabase.from('hero_slides').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
