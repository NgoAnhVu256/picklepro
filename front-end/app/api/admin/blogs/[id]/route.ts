import { NextRequest, NextResponse } from 'next/server'
import { BlogService } from '@picklepro/back-end'
import { getAdminUser, adminUnauthorized } from '../../_helpers'
import { notifyAdminRealtime } from '../../_realtime'

const blogService = new BlogService()

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  try {
    const { id } = await params
    const body = await req.json()
    const data = await blogService.updateBlog(id, body)
    await notifyAdminRealtime({ scope: 'blogs', action: 'updated' })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  try {
    const { id } = await params
    const data = await blogService.deleteBlog(id)
    await notifyAdminRealtime({ scope: 'blogs', action: 'deleted' })
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
