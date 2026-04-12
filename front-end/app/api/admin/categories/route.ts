import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@picklepro/back-end'
import { getAdminUser, adminUnauthorized } from '../_helpers'

const adminService = new AdminService()

export async function GET() {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()
  try {
    const data = await adminService.getAdminCategories()
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()
  try {
    const body = await req.json()
    const data = await adminService.createCategory(body)
    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
