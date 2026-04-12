import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@picklepro/back-end'
import { getAdminUser, adminUnauthorized } from '../_helpers'

const adminService = new AdminService()

export async function GET(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || 1)
  const search = searchParams.get('search') || ''
  try {
    return NextResponse.json(await adminService.getAdminCustomers(page, 20, search))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
