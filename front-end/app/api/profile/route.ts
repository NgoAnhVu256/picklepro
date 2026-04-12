// ============================================
// Profile API — GET + PATCH user profile
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@picklepro/back-end'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    // Lấy profile từ profiles table
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Lấy số đơn hàng
    const { count: orderCount } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || user.user_metadata?.full_name || '',
        phone: profile?.phone || user.user_metadata?.phone || '',
        address: profile?.address || '',
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || '',
      },
      stats: {
        orderCount: orderCount || 0,
      }
    })
  } catch (error: any) {
    console.error('[API /profile] Error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Lỗi server' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    const body = await request.json()
    const { fullName, phone, address } = body

    // Upsert profile
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: fullName,
        phone,
        address,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error('[API /profile] Error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Lỗi server' }, { status: 500 })
  }
}
