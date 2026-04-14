import { NextRequest, NextResponse } from 'next/server'
import { BlogService } from '@picklepro/back-end'

const blogService = new BlogService()

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const data = await blogService.getBlogBySlug(params.slug)
    return NextResponse.json(data)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status || 500 })
  }
}
