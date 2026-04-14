"use client"

import { ArrowRight, ChevronRight, TrendingUp } from "lucide-react"
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
        const res = await fetch('/api/blogs?limit=5')
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

  if (loading) return <div className="py-20 text-center text-white">Đang tải bài viết...</div>
  if (blogs.length === 0) return null

  const featuredBlog = blogs[0]
  const listBlogs = blogs.slice(1, 4)

  return (
    <section
      id="home-blog-section"
      className="py-12 sm:py-20"
      style={{ background: "linear-gradient(180deg, #04002A, #362012, #462915)" }}
    >
      <div className="container mx-auto px-4 max-w-7xl">
        
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
            Bài Viết <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #B2FF73, #EDFEB9)" }}>Nổi Bật</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto">
            Cập nhật kiến thức, xu hướng và chia sẻ từ cộng đồng Pickleball
          </p>
        </div>

        {/* 3-Column Layout exactly like provided UI */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* COLUMN 1: Banner "Tham gia cộng đồng" */}
          <div className="lg:col-span-1 rounded-[2rem] p-8 flex flex-col relative overflow-hidden bg-gradient-to-b from-[#B4C6FF] to-[#E2EAFD] shadow-xl">
            <div className="relative z-10 text-center mt-2 flex-col items-center">
              <h3 className="text-white font-black text-2xl uppercase tracking-wider mb-2 drop-shadow-md pb-2 border-b-2 border-white/30 inline-block">
                Tham Gia
              </h3>
              <h3 className="text-[#FF5C8A] font-black text-2xl uppercase drop-shadow-sm mt-1">
                Cộng Đồng<br/>Pickleball
              </h3>
              
              <div className="mt-8 mb-6 mx-auto w-32 h-32 relative">
                {/* 3D-like Mockup image representation */}
                <Image src="/logo.png" alt="PicklePro" fill className="object-contain drop-shadow-2xl rounded-2xl" />
              </div>
              
              <p className="text-[#6C85D8] text-xs font-bold uppercase tracking-widest mb-6">
                Chinh phục kỹ năng<br/>cùng hàng ngàn vợt thủ
              </p>
              
              <a 
                href="https://www.facebook.com/profile.php?id=61575468045037" 
                target="_blank" 
                rel="noreferrer"
                className="bg-white/80 backdrop-blur-md text-[#5054FE] font-bold text-sm px-8 py-3 rounded-full hover:bg-white transition-colors shadow-lg w-full inline-block uppercase tracking-wide"
              >
                Tham Gia
              </a>
            </div>
            {/* Background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 blur-3xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FF5C8A]/20 blur-3xl rounded-full" />
          </div>


          {/* COLUMN 2: Featured Blog (Bigger Slider/Hero style) */}
          <Link href={`/blogs/${featuredBlog.slug}`} className="lg:col-span-2 group">
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl h-full flex flex-col transition-transform hover:-translate-y-1 duration-300">
              <div className="relative flex-1 min-h-[250px] sm:min-h-[300px] w-full bg-blue-50 overflow-hidden">
                {featuredBlog.thumbnail?.startsWith('http') ? (
                  <Image src={featuredBlog.thumbnail} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {featuredBlog.thumbnail || '📰'}
                  </div>
                )}
                {/* Next/Prev Arrows overlay (Visual only as per UI) */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white"><ChevronRight className="h-5 w-5 rotate-180" /></div>
                  <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white"><ChevronRight className="h-5 w-5" /></div>
                </div>
              </div>
              
              <div className="p-6 sm:p-8 bg-white border-t border-gray-100 relative">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-[#FF5C8A] transition-colors leading-tight mb-2">
                  {featuredBlog.title}
                </h3>
                <div className="w-8 h-1 bg-[#FF5C8A] rounded-full mx-auto absolute -bottom-1 left-1/2 -translate-x-1/2" />
              </div>
            </div>
          </Link>


          {/* COLUMN 3: Latest Blogs List */}
          <div className="lg:col-span-1 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2 border border-[#FF5C8A]/30 bg-[#FF5C8A]/10 text-[#FF5C8A] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                <TrendingUp className="h-3.5 w-3.5" /> Tin nổi bật
              </div>
              <Link href="/blogs" className="text-[#FF5C8A] text-xs font-bold uppercase tracking-wide hover:underline decoration-2 underline-offset-4">
                Xem thêm
              </Link>
            </div>

            <div className="bg-white rounded-[2rem] p-5 shadow-xl flex-1 flex flex-col gap-5 justify-between">
              {listBlogs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
                  Chưa có bài viết khác.
                </div>
              ) : (
                listBlogs.map(blog => (
                  <Link href={`/blogs/${blog.slug}`} key={blog.id} className="group flex flex-col gap-2 relative border-b border-gray-50 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex gap-3">
                      {/* Thumnail small */}
                      <div className="w-20 h-16 shrink-0 rounded-xl overflow-hidden bg-gray-100 relative">
                        {blog.thumbnail?.startsWith('http') ? (
                          <Image src={blog.thumbnail} alt="" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-2xl">{blog.thumbnail || '📰'}</div>
                        )}
                      </div>
                      
                      {/* Content small */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-sm font-bold text-gray-800 leading-snug group-hover:text-[#FF5C8A] transition-colors line-clamp-2">
                          {blog.title}
                        </h4>
                        <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 font-medium">
                          <span>{blog.author || 'PicklePro'}</span>
                          <span>|</span>
                          <span>{format(new Date(blog.created_at), 'd MMMM, yyyy', { locale: vi })}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
