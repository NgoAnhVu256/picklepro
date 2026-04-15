import { NextRequest, NextResponse } from 'next/server'
import { BlogService } from '@picklepro/back-end'
import { getAdminUser, adminUnauthorized } from '../_helpers'
import { notifyAdminRealtime } from '../_realtime'

const blogService = new BlogService()

export async function GET(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || 1)
  const limit = Number(searchParams.get('limit') || 20)
  const search = searchParams.get('search') || ''

  try {
    const data = await blogService.getAdminBlogs(page, limit, search)
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
    const data = await blogService.createBlog(body)
    await notifyAdminRealtime({ scope: 'blogs', action: 'created' })
    return NextResponse.json(data, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
