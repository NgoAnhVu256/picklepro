import { NextRequest, NextResponse } from 'next/server'
import { BlogService } from '@picklepro/back-end'

const blogService = new BlogService()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') || 1)
  const limit = Number(searchParams.get('limit') || 20)

  try {
    const data = await blogService.getPublishedBlogs(page, limit)
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
