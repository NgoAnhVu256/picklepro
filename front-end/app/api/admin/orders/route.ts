import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@picklepro/back-end'
import { getAdminUser, adminUnauthorized } from '../_helpers'

const adminService = new AdminService()

export async function GET(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) {
    console.error('[Admin Orders] Unauthorized access attempt')
    return adminUnauthorized()
  }
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || 1)
  const limit = Number(searchParams.get('limit') || 20)
  const status = searchParams.get('status') || ''
  try {
    const result = await adminService.getAdminOrders(page, limit, status)
    console.log(`[Admin Orders] Found ${result.total} orders (page ${page})`)
    return NextResponse.json(result)
  } catch (e: any) {
    console.error('[Admin Orders] Error:', e.message, e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
