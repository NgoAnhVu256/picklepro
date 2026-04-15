import { Header } from "@/components/pickleball/header"
import { Footer } from "@/components/pickleball/footer"
import { Facebook, Twitter, Link2, Share2 } from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import Image from "next/image"
import { BlogService } from "@picklepro/back-end"
import Link from "next/link"
import type { Metadata } from "next"

// For SSR nextjs config
export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://picklepro.vn'

async function getBlog(slug: string) {
  const service = new BlogService()
  try {
    const blog = await service.getBlogBySlug(slug)
    return blog
  } catch {
    return null
  }
}

async function getRelatedBlogs() {
  const service = new BlogService()
  try {
    const { blogs } = await service.getPublishedBlogs(1, 5)
    return blogs
  } catch {
    return []
  }
}

// Dynamic SEO metadata cho từng bài blog
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getBlog(params.slug)
  if (!blog) {
    return { title: 'Bài viết không tồn tại | PicklePro' }
  }
  const description = blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').substring(0, 160) || ''
  return {
    title: `${blog.title} | PicklePro Blog`,
    description,
    openGraph: {
      title: blog.title,
      description,
      type: 'article',
      url: `${APP_URL}/blogs/${blog.slug}`,
      siteName: 'PicklePro',
      locale: 'vi_VN',
      publishedTime: blog.created_at,
      authors: [blog.author || 'PicklePro'],
      ...(blog.thumbnail ? { images: [{ url: blog.thumbnail, width: 1200, height: 630, alt: blog.title }] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.title,
      description,
      ...(blog.thumbnail ? { images: [blog.thumbnail] } : {}),
    },
    alternates: { canonical: `${APP_URL}/blogs/${blog.slug}` },
  }
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await getBlog(params.slug)
  const related = await getRelatedBlogs()

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white via-[#f8fafc] to-[#f1f5f9] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-muted-foreground">Không tìm thấy bài viết.</p>
        </div>
        <Footer />
      </div>
    )
  }

  const dateStr = format(new Date(blog.created_at), 'd MMMM, yyyy', { locale: vi })

  // Article JSON-LD cho Google/AI Search
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').substring(0, 160) || '',
    url: `${APP_URL}/blogs/${blog.slug}`,
    datePublished: blog.created_at,
    dateModified: blog.updated_at || blog.created_at,
    author: { '@type': 'Person', name: blog.author || 'PicklePro' },
    publisher: {
      '@type': 'Organization',
      name: 'PicklePro',
      url: APP_URL,
      logo: { '@type': 'ImageObject', url: `${APP_URL}/favicon.ico` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${APP_URL}/blogs/${blog.slug}` },
    ...(blog.thumbnail ? { image: blog.thumbnail } : {}),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: APP_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${APP_URL}/blogs` },
      { '@type': 'ListItem', position: 3, name: blog.title },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f8fafc] to-[#f1f5f9]">
      <Header />
      {/* JSON-LD Structured Data for SEO + AI */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12 text-gray-900">
          
          {/* LEFT SIDEBAR: SHARE & AUTHOR */}
          <div className="lg:w-64 shrink-0 mt-2 space-y-8">
            <div className="text-center">
              <h3 className="font-bold text-gray-600 mb-4 text-sm uppercase">Chia sẻ bài viết</h3>
              <div className="flex items-center justify-center gap-3">
                <button className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <Facebook className="h-4 w-4" />
                </button>
                <button className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors">
                  <Share2 className="h-4 w-4" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-colors">
                  <Twitter className="h-4 w-4" />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center hover:bg-gray-800 hover:text-white transition-colors">
                  <Link2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="text-center pt-8 border-t border-gray-100">
              <div className="w-20 h-20 mx-auto rounded-full bg-lime/20 mb-4 overflow-hidden border-2 border-white shadow-lg">
                <Image src="/favicon.ico" alt="PicklePro" width={80} height={80} className="object-cover w-full h-full" unoptimized />
              </div>
              <p className="text-sm font-medium text-gray-500 mb-4">Xem bài viết này<br/>trên Facebook</p>
              <a 
                href="https://www.facebook.com/profile.php?id=61575468045037" 
                target="_blank" 
                rel="noreferrer"
                className="block w-full py-2.5 px-4 bg-indigo-50 text-indigo-600 rounded-xl font-semibold text-sm hover:bg-indigo-600 hover:text-white transition-colors"
              >
                Theo dõi PicklePro
              </a>
            </div>

            <div className="pt-8 border-t border-gray-100">
              <p className="text-sm text-gray-500 leading-relaxed text-center">
                Follow PicklePro để cập nhật thêm các tin tức và nguồn cảm hứng sáng tạo từ khắp nơi trên thế giới ✨
              </p>
            </div>
          </div>

          {/* MIDDLE: MAIN CONTENT */}
          <div className="flex-1 max-w-3xl">
            {/* Categories Tags */}
            <div className="flex items-center gap-4 mb-6 text-sm font-medium text-indigo-500">
              <span className="border-b-2 border-lime/40 pb-1 text-lime-dark">{blog.category_name}</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
              {blog.title}
            </h1>

            {/* Author / Date */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-10">
              <span className="font-medium">{blog.author || 'PicklePro'}</span>
              <span>|</span>
              <span className="flex items-center gap-1">⏱ {dateStr}</span>
            </div>

            {/* Content properly formatted */}
            <div 
              className="prose prose-lg max-w-none prose-img:rounded-2xl prose-a:text-lime-dark hover:prose-a:text-lime-dark/80 prose-headings:font-bold"
              dangerouslySetInnerHTML={{ __html: blog.content || '' }} 
            />
          </div>

          {/* RIGHT SIDEBAR: SUGGESTIONS */}
          <div className="lg:w-80 shrink-0">
            <h3 className="text-xl font-bold text-lime-dark mb-6">PicklePro đề xuất</h3>
            <div className="space-y-6">
              {related.filter(r => r.id !== blog.id).map(item => (
                <Link href={`/blogs/${item.slug}`} key={item.id} className="block group">
                  <h4 className="font-bold text-foreground leading-snug group-hover:text-lime-dark transition-colors mb-2">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="font-medium">{item.author || 'PicklePro'}</span>
                    <span>|</span>
                    <span>⏱ {format(new Date(item.created_at), 'd MMMM, yyyy', { locale: vi })}</span>
                  </div>
                  <div className="h-px bg-gray-100 mt-6" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
