import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '../_helpers'
import { notifyAdminRealtime } from '../_realtime'

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ slides: data ?? [] })
}

export async function POST(req: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  const body = await req.json()
  const supabase = await createClient()

  // Map image_url -> bg_gradient and position -> badge
  const { data, error } = await supabase
    .from('hero_slides')
    .insert({
      badge: body.position ?? 'hero',
      title: body.title ?? '',
      title_highlight: '',
      description: '',
      button_text: '',
      button_gradient: '',
      bg_gradient: body.image_url ?? '',
      href: body.href ?? '',
      sort_order: body.sort_order ?? 0,
      is_active: body.is_active ?? true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await notifyAdminRealtime({ scope: 'slides', action: 'created' })
  return NextResponse.json({ slide: data })
}
