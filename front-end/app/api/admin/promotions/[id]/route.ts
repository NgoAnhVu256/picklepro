import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@picklepro/back-end'
import { getAdminUser, adminUnauthorized } from '../../_helpers'
import { notifyAdminRealtime } from '../../_realtime'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  const { id } = await params
  try {
    const body = await req.json()
    const { data, error } = await supabaseAdmin
      .from('promotions')
      .update({
        code: body.code,
        description: body.description,
        discount_type: body.discount_type,
        discount_value: body.discount_value,
        min_order_value: body.min_order_value,
        max_discount: body.max_discount,
        usage_limit: body.usage_limit,
        starts_at: body.starts_at,
        expires_at: body.expires_at,
        is_active: body.is_active,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    await notifyAdminRealtime({ scope: 'promotions', action: 'updated' })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  const { id } = await params
  try {
    const { error } = await supabaseAdmin
      .from('promotions')
      .delete()
      .eq('id', id)

    if (error) throw error
    await notifyAdminRealtime({ scope: 'promotions', action: 'deleted' })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
