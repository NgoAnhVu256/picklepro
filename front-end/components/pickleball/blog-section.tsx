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
      className="py-12 sm:py-20"
      style={{ background: "linear-gradient(180deg, #04002A, #362012, #462915)" }}
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
            Bài Viết <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #B2FF73, #EDFEB9)" }}>Nổi Bật</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
            Cập nhật kiến thức, xu hướng và chia sẻ từ cộng đồng Pickleball
          </p>
        </div>

        {/* Blog Grid - Dynamic layout based on categories size */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(4, Math.max(1, displayCategories.length))} gap-6 sm:gap-8`}>
          {displayCategories.map((category) => (
            <div key={category.name}>
              {/* Category Header */}
              <h3 className="text-lg font-bold text-white mb-4 pb-2 border-b border-white/10 italic">
                {category.name}
              </h3>

              {/* Articles */}
              <div className="space-y-4">
                {category.articles.slice(0, 4).map((article) => (
                  <Link
                    key={article.id}
                    href={`/blogs/${article.slug}`}
                    className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all duration-200"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 shrink-0 rounded-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 overflow-hidden relative flex items-center justify-center text-2xl shadow-md shadow-black/20 group-hover:shadow-lg group-hover:shadow-purple-500/10 transition-shadow">
                      {article.thumbnail?.startsWith('http') ? (
                        <Image src={article.thumbnail} alt="" fill className="object-cover" />
                      ) : (
                        article.thumbnail || '📰'
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-200 line-clamp-2 group-hover:text-white transition-colors leading-snug">
                        {article.title}
                      </h4>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {format(new Date(article.created_at), 'dd/MM/yyyy', { locale: vi })}
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Xem thêm */}
                {category.articles.length > 4 && (
                  <Link
                    href="#"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors pt-1 pl-2"
                  >
                    Xem thêm <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
