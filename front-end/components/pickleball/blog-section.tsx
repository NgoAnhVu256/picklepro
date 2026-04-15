"use client"

import Link from "next/link"
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useAdminRealtime } from "@/hooks/use-admin-realtime"

export function BlogSection() {
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true, containScroll: 'trimSnaps' })

  const fetchBlogs = useCallback(async (withLoading = false) => {
    if (withLoading) setLoading(true)
    try {
      const res = await fetch('/api/blogs?limit=10')
      const data = await res.json()
      setBlogs(data.blogs || [])
    } catch {
      // Ignore transient fetch errors.
    } finally {
      if (withLoading) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBlogs(true)
    const interval = setInterval(() => fetchBlogs(false), 20000)
    return () => clearInterval(interval)
  }, [fetchBlogs])

  useAdminRealtime({
    scopes: ['blogs'],
    onChange: () => {
      fetchBlogs(false)
    },
  })

  const scrollPrev = () => emblaApi && emblaApi.scrollPrev()
  const scrollNext = () => emblaApi && emblaApi.scrollNext()

  if (loading) return (
    <div className="py-12 flex justify-center">
      <div className="animate-pulse flex gap-4 overflow-hidden w-full max-w-[1200px] px-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="flex-[0_0_80%] sm:flex-[0_0_40%] md:flex-[0_0_30%] lg:flex-[0_0_24%] min-w-0">
            <div className="aspect-[16/10] bg-gray-200 rounded-2xl mb-4" />
            <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )

  if (blogs.length === 0) return null;

  return (
    <section id="home-blog-section" className="py-10 md:py-16 bg-white/50 border-t border-black/5">
      <div className="container mx-auto px-4 max-w-[1200px]">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-black mb-3">Tin tức Pickleball</h2>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
            Cập nhật cảm hứng, xu hướng và chia sẻ từ cộng đồng
          </p>
        </div>

        {/* Carousel */}
        <div className="relative group/carousel">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 md:gap-6 pb-4 cursor-grab active:cursor-grabbing">
              {blogs.map((article) => (
                <Link
                  key={article.id}
                  href={`/blogs/${article.slug}`}
                  className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_24%] min-w-0 group"
                  draggable={false}
                >
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-4 bg-gray-100 shadow-sm border border-black/5">
                    {article.thumbnail?.startsWith('http') ? (
                      <Image 
                        src={article.thumbnail} 
                        alt={article.title} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-500">📰</div>
                    )}
                  </div>

                  <div className="px-1 text-left">
                    <h3 className="font-bold text-[15px] md:text-[16px] text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-lime-dark transition-colors">
                      {article.title}
                    </h3>
                    <div className="text-[12px] text-gray-400 font-medium">
                       <span>PicklePro</span>
                       <span className="mx-2">|</span>
                       <span>{article.created_at ? format(new Date(article.created_at), "dd 'tháng' MM, yyyy", { locale: vi }) : 'Mới nhất'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button 
             onClick={scrollPrev}
             className="absolute left-[-1.5rem] top-[40%] -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:text-black hover:scale-110 transition-all opacity-0 md:group-hover/carousel:opacity-100 -translate-x-full group-hover/carousel:translate-x-0 z-10 border border-black/5"
          >
             <ChevronLeft className="w-5 h-5 ml-[-0.1rem]" />
          </button>
          <button 
             onClick={scrollNext}
             className="absolute right-[-1.5rem] top-[40%] -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:text-black hover:scale-110 transition-all opacity-0 md:group-hover/carousel:opacity-100 translate-x-full group-hover/carousel:-translate-x-0 z-10 border border-black/5"
          >
             <ChevronRight className="w-5 h-5 ml-[0.1rem]" />
          </button>
        </div>

      </div>
    </section>
  )
}
