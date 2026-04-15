import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@picklepro/back-end'
import { getAdminUser, adminUnauthorized } from '../../_helpers'
import { notifyAdminRealtime } from '../../_realtime'

const adminService = new AdminService()

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()
  const { id } = await params
  try {
    const body = await req.json()
    const data = await adminService.updateCategory(id, body)
    await notifyAdminRealtime({ scope: 'categories', action: 'updated' })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()
  const { id } = await params
  try {
    await adminService.deleteCategory(id)
    await notifyAdminRealtime({ scope: 'categories', action: 'deleted' })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
