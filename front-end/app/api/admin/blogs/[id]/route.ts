import { NextRequest, NextResponse } from 'next/server'
import { BlogService } from '@picklepro/back-end'
import { getAdminUser, adminUnauthorized } from '../../_helpers'

const blogService = new BlogService()

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  try {
    const body = await req.json()
    const data = await blogService.updateBlog(params.id, body)
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  try {
    const data = await blogService.deleteBlog(params.id)
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
