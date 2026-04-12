// Helper: Verify admin từ token
import { createClient } from '@/lib/supabase/server'
import { AdminService } from '@picklepro/back-end'
import { NextResponse } from 'next/server'

export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const adminService = new AdminService()
  const isAdmin = await adminService.verifyAdmin(user.id)
  if (!isAdmin) return null

  return user
}

export function adminUnauthorized() {
  return NextResponse.json({ error: 'Không có quyền admin' }, { status: 403 })
}
