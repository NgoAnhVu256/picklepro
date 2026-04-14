import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '../_helpers'

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

  const { data, error } = await supabase
    .from('hero_slides')
    .insert({
      badge: body.badge ?? '',
      title: body.title ?? '',
      title_highlight: body.title_highlight ?? '',
      description: body.description ?? '',
      button_text: body.button_text ?? 'Xem ngay',
      button_gradient: body.button_gradient ?? 'linear-gradient(135deg, #5054FE, #9B56FF)',
      bg_gradient: body.bg_gradient ?? 'from-purple-100 via-blue-50 to-pink-100',
      href: body.href ?? '/products',
      sort_order: body.sort_order ?? 0,
      is_active: body.is_active ?? true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ slide: data })
}
