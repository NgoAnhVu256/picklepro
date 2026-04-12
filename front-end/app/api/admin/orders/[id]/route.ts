import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@picklepro/back-end'
import { getAdminUser, adminUnauthorized } from '../../_helpers'

const adminService = new AdminService()

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()
  const { id } = await params
  try {
    return NextResponse.json(await adminService.getAdminOrderDetail(id))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 404 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()
  const { id } = await params
  try {
    const { status } = await req.json()
    return NextResponse.json(await adminService.updateOrderStatus(id, status))
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
