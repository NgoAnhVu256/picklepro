"use client"

import { Calendar, ArrowRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export function BlogSection() {
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch('/api/blogs?limit=20')
        const data = await res.json()
        setBlogs(data.blogs || [])
      } catch (error) {
        console.error("Failed to load blogs")
      } finally {
        setLoading(false)
      }
    }
    fetchBlogs()
  }, [])

  // Group by category
  const categoriesMap: Record<string, any[]> = {}
  blogs.forEach(b => {
    const cat = b.category_name || 'Khác'
    if (!categoriesMap[cat]) categoriesMap[cat] = []
    categoriesMap[cat].push(b)
  })

  // Convert to array format 
  let displayCategories = Object.keys(categoriesMap).map(name => ({
    name,
    articles: categoriesMap[name]
  }))

  if (loading) return <div className="py-20 text-center text-white">Đang tải bài viết...</div>

  // If no real data, maybe skip rendering, but for now we just show empty
  if (blogs.length === 0) return null;

  return (
    <section
      id="home-blog-section"
      className="py-12"
      style={{ background: "linear-gradient(180deg, #100a16 0%, #150a0a 50%, #2f1b0d 100%)" }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Blog Grid - Dynamic layout based on categories size */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(4, Math.max(1, displayCategories.length))} gap-x-8 gap-y-12`}>
          {displayCategories.map((category) => (
            <div key={category.name} className="flex flex-col">
              {/* Category Header */}
              <h3 className="text-lg font-semibold text-[#CFA9FD] mb-6 pb-3 border-b border-[#CFA9FD]/20">
                {category.name}
              </h3>

              {/* Articles */}
              <div className="space-y-5 flex-1">
                {category.articles.slice(0, 4).map((article) => (
                  <Link
                    key={article.id}
                    href={`/blogs/${article.slug}`}
                    className="group flex items-center gap-4 transition-all duration-200"
                  >
                    {/* Thumbnail - 16:9 Aspect Ratio like the image */}
                    <div className="w-[120px] shrink-0 aspect-[16/9] rounded-lg bg-[#2a2a2a] overflow-hidden relative shadow-md">
                      {article.thumbnail?.startsWith('http') ? (
                        <Image src={article.thumbnail} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">📰</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] md:text-sm font-medium text-gray-100 line-clamp-3 group-hover:text-white transition-colors leading-snug">
                        {article.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Xem thêm button at the bottom of the column */}
              {category.articles.length > 4 ? (
                <div className="mt-6">
                  <Link
                    href={`/products?category=${category.name}`}
                    className="inline-flex items-center text-xs font-medium text-gray-300 bg-white/10 hover:bg-white/20 transition-colors px-4 py-1.5 rounded-full"
                  >
                    Xem thêm
                  </Link>
                </div>
              ) : (
                <div className="mt-6">
                  <Link
                    href={`/blogs`}
                    className="inline-flex items-center text-xs font-medium text-gray-300 bg-white/10 hover:bg-white/20 transition-colors px-4 py-1.5 rounded-full"
                  >
                    Xem thêm
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
