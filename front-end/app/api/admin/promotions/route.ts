import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@picklepro/back-end'
import { getAdminUser, adminUnauthorized } from '../_helpers'

export async function GET(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''

  try {
    let query = supabaseAdmin
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false })

    if (search) query = query.ilike('code', `%${search}%`)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ promotions: data ?? [] })
  } catch (e: any) {
    console.error('[Admin Promotions] Error:', e.message)
    return NextResponse.json({ promotions: [] })
  }
}

export async function POST(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  try {
    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from('promotions')
      .insert({
        code: body.code,
        description: body.description || '',
        discount_type: body.discount_type || 'percent',
        discount_value: body.discount_value || 0,
        min_order_value: body.min_order_value || 0,
        max_discount: body.max_discount || null,
        usage_limit: body.usage_limit || 100,
        used_count: 0,
        starts_at: body.starts_at || new Date().toISOString(),
        expires_at: body.expires_at || null,
        is_active: body.is_active ?? true,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    console.error('[Admin Promotions] Error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
