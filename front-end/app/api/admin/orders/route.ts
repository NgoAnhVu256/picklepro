import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@picklepro/back-end'
import { getAdminUser, adminUnauthorized } from '../_helpers'

const adminService = new AdminService()

export async function GET(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || 1)
  const limit = Number(searchParams.get('limit') || 20)
  const status = searchParams.get('status') || ''
  try {
    return NextResponse.json(await adminService.getAdminOrders(page, limit, status))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
