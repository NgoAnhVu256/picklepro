import { NextResponse } from 'next/server'
import { AdminService } from '@picklepro/back-end'
import { getAdminUser, adminUnauthorized } from '../_helpers'

const adminService = new AdminService()

export async function GET() {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  try {
    const data = await adminService.getDashboardStats()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
