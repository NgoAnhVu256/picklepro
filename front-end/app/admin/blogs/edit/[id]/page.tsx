'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'
import { BlogEditorForm } from '@/components/pickleball/blog-editor-form'

export default function EditBlogPage() {
  const params = useParams()
  const id = params.id as string
  const [initialData, setInitialData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch_() {
      try {
        const res = await fetch(`/api/admin/blogs`)
        const data = await res.json()
        const blog = (data.blogs || []).find((b: any) => b.id === id)
        if (blog) {
          setInitialData({
            title: blog.title ?? '',
            slug: blog.slug ?? '',
            excerpt: blog.excerpt ?? '',
            category_name: blog.category_name ?? 'Tin tức',
            thumbnail: blog.thumbnail ?? '',
            content: blog.content ?? '',
            author: blog.author ?? 'Admin',
            is_published: blog.is_published ?? true,
            // SEO fields
            seo_title: blog.seo_title ?? '',
            seo_description: blog.seo_description ?? '',
            meta_keywords: blog.meta_keywords ?? '',
            canonical_url: blog.canonical_url ?? '',
            robots_index: blog.robots_index ?? 'index',
            robots_follow: blog.robots_follow ?? 'follow',
            // Open Graph
            og_title: blog.og_title ?? '',
            og_description: blog.og_description ?? '',
            og_image: blog.og_image ?? '',
          })
        } else {
          toast.error('Không tìm thấy bài viết')
        }
      } catch {
        toast.error('Lỗi khi tải bài viết')
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60 text-muted-foreground">
        <span className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-3" />
        Đang tải bài viết...
      </div>
    )
  }

  if (!initialData) return (
    <div className="text-center py-20 text-muted-foreground">Không tìm thấy bài viết</div>
  )

  return <BlogEditorForm mode="edit" blogId={id} initialData={initialData} />
}
