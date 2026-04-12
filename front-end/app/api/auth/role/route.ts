import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@picklepro/back-end'

// GET /api/auth/role — Trả về role của user hiện tại
// Dùng supabaseAdmin để bypass RLS — chỉ đọc role của chính user đó
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ role: 'guest' })

  const { data } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return NextResponse.json({ role: data?.role ?? 'user' })
}
