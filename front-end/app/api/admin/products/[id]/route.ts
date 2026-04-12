import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@picklepro/back-end'
import { getAdminUser, adminUnauthorized } from '../../_helpers'

const adminService = new AdminService()

// PUT /api/admin/products/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  const { id } = await params
  try {
    const body = await req.json()
    const data = await adminService.updateProduct(id, body)
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

// DELETE /api/admin/products/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  const { id } = await params
  try {
    await adminService.deleteProduct(id)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
