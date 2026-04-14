'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, TrendingUp, Shield, Star, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

// ─── Static fallback slides ─────────────────────────────────────────────────
const FALLBACK_SLIDES = [
  {
    id: '1', badge: '🔥 Hot Deal', title: 'Professional', title_highlight: 'Pickleball Gear',
    description: 'Khám phá bộ sưu tập vợt & phụ kiện Pickleball cao cấp từ các thương hiệu hàng đầu thế giới.',
    button_text: 'Khám phá ngay', button_gradient: 'linear-gradient(135deg, #5054FE, #9B56FF)',
    bg_gradient: 'from-indigo-100 via-purple-50 to-pink-100', href: '/products',
  },
  {
    id: '2', badge: '⭐ Best Seller', title: 'Thương hiệu', title_highlight: 'Số 1 Thế Giới',
    description: 'Vợt #1 — Carbon fiber cứng, spin tối đa, kiểm soát tuyệt hảo. Giao hàng toàn quốc.',
    button_text: 'Xem ngay', button_gradient: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
    bg_gradient: 'from-orange-100 via-red-50 to-yellow-100', href: '/products',
  },
  {
    id: '3', badge: '🎁 Flash Sale', title: 'Giảm đến 50%', title_highlight: 'Combo Tiết Kiệm',
    description: 'Mua vợt + túi + grip — tiết kiệm ngay 50%. Số lượng có hạn, nhanh tay lên!',
    button_text: 'Mua combo', button_gradient: 'linear-gradient(135deg, #11998E, #38EF7D)',
    bg_gradient: 'from-green-100 via-teal-50 to-lime-100', href: '/products',
  },
]

function HeroSlider({ slides }: { slides: typeof FALLBACK_SLIDES }) {
  const [current, setCurrent] = useState(0)
  const list = slides.length > 0 ? slides : FALLBACK_SLIDES

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % list.length), 5000)
    return () => clearInterval(t)
  }, [list.length])

  const slide = list[current]

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: '320px' }}>
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg_gradient} transition-all duration-700`} />

      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-white/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-white/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-8 md:p-10 flex flex-col justify-center h-full" style={{ minHeight: '320px' }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 w-fit mb-4">
          <span className="text-sm font-semibold text-gray-800">{slide.badge}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight mb-3 text-gray-900">
          {slide.title}{' '}
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: slide.button_gradient }}>
            {slide.title_highlight}
          </span>
        </h1>
        <p className="text-sm text-gray-700 max-w-md mb-6 leading-relaxed">{slide.description}</p>
        <div className="flex items-center gap-4 flex-wrap">
          <Link href={slide.href}>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-bold text-sm shadow-lg hover:scale-105 hover:opacity-90 transition-all"
              style={{ background: slide.button_gradient }}>
              {slide.button_text} <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-gray-600">
              <Shield className="h-3.5 w-3.5 text-lime-600" /> BH 12 tháng
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-600">
              <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-400" /> 4.9/5 (2000+)
            </span>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button onClick={() => setCurrent(c => (c - 1 + list.length) % list.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-all z-20">
        <ChevronLeft className="h-5 w-5 text-gray-700" />
      </button>
      <button onClick={() => setCurrent(c => (c + 1) % list.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm shadow flex items-center justify-center hover:bg-white transition-all z-20">
        <ChevronRight className="h-5 w-5 text-gray-700" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {list.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all ${i === current ? 'w-7 bg-white shadow' : 'w-2 bg-white/50 hover:bg-white/70'}`} />
        ))}
      </div>
    </div>
  )
}

// ─── Article Card (small row) ─────────────────────────────────────────────
function ArticleRow({ blog }: { blog: any }) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="group flex gap-3 items-start hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors">
      <div className="relative w-20 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-200">
        {blog.thumbnail?.startsWith('http') ? (
          <Image src={blog.thumbnail} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">📰</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">{blog.title}</h4>
        <p className="text-[10px] text-gray-400 mt-1">{format(new Date(blog.created_at), 'dd/MM/yyyy', { locale: vi })}</p>
      </div>
    </Link>
  )
}

// ─── Article Card (medium - bottom grid) ─────────────────────────────────
function ArticleMedium({ blog }: { blog: any }) {
  return (
    <Link href={`/blogs/${blog.slug}`} className="group flex gap-3 items-start hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors">
      <div className="relative w-24 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-200">
        {blog.thumbnail?.startsWith('http') ? (
          <Image src={blog.thumbnail} alt={blog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">📰</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-indigo-500 uppercase mb-0.5">{blog.category_name || 'Tin tức'}</p>
        <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-snug">{blog.title}</h4>
        <p className="text-[10px] text-gray-400 mt-1">{blog.author || 'PicklePro'} | {format(new Date(blog.created_at), 'dd/MM/yyyy', { locale: vi })}</p>
      </div>
    </Link>
  )
}

// ─── Main Homepage Content ─────────────────────────────────────────────────
export function HomeContent() {
  const [slides, setSlides] = useState<any[]>([])
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/slides').then(r => r.json()).catch(() => ({ slides: [] })),
      fetch('/api/blogs?limit=20').then(r => r.json()).catch(() => ({ blogs: [] })),
    ]).then(([s, b]) => {
      setSlides((s.slides ?? []).filter((sl: any) => sl.is_active))
      setBlogs(b.blogs ?? [])
      setLoading(false)
    })
  }, [])

  const featuredBlog = blogs[0]
  const sidebarBlogs = blogs.slice(1, 5)
  const gridBlogs = blogs.slice(5, 14)

  return (
    <section id="home-blog-section" className="py-6 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_280px] gap-6">

          {/* ─── LEFT SIDEBAR (like piklab left panel) ─── */}
          <div className="hidden lg:flex flex-col gap-4">
            {/* Community promo card */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 bg-gradient-to-br from-indigo-50 to-purple-100 p-5 flex flex-col items-center text-center shadow-sm">
              <span className="text-4xl mb-2">🏓</span>
              <h3 className="font-bold text-gray-800 text-sm mb-1">Cộng đồng PicklePro</h3>
              <p className="text-xs text-gray-600 mb-3 leading-snug">Chia sẻ & giao lưu cùng cộng đồng Pickleball VN</p>
              <a href="https://www.facebook.com/profile.php?id=61575468045037" target="_blank" rel="noreferrer"
                className="inline-block w-full py-2 rounded-xl bg-white text-indigo-600 text-xs font-bold border border-indigo-200 hover:bg-indigo-600 hover:text-white transition-colors">
                Tham gia
              </a>
            </div>

            {/* Quick links */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              {[
                { label: 'Vợt Pickleball', href: '/products?category=vot-pickleball', emoji: '🏓' },
                { label: 'Phụ kiện', href: '/products?category=phu-kien', emoji: '🎒' },
                { label: 'Bóng & Lưới', href: '/products?category=bong-pickleball', emoji: '⚾' },
                { label: 'Giày thể thao', href: '/products?category=giay-the-thao', emoji: '👟' },
                { label: 'Quần áo', href: '/products?category=quan-ao', emoji: '👕' },
              ].map(item => (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-0 text-sm text-gray-700 hover:text-indigo-600">
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* ─── CENTER: Hero + Article Grid ─── */}
          <div className="flex flex-col gap-6">
            {/* Hero Slider */}
            <HeroSlider slides={slides} />

            {/* Featured blog (large) + right mini list */}
            {blogs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-[1fr_260px] gap-6">
                {/* Main Featured Article */}
                {featuredBlog && (
                  <Link href={`/blogs/${featuredBlog.slug}`} className="group">
                    <div className="relative rounded-2xl overflow-hidden bg-gray-200 aspect-[16/9]">
                      {featuredBlog.thumbnail?.startsWith('http') ? (
                        <Image src={featuredBlog.thumbnail} alt={featuredBlog.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-indigo-100 to-purple-100">📰</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <span className="inline-block text-[10px] font-semibold text-white/80 bg-white/20 px-2 py-0.5 rounded-full mb-2 backdrop-blur-sm">
                          {featuredBlog.category_name || 'Tin tức'}
                        </span>
                        <h2 className="text-white font-bold text-base leading-snug line-clamp-2 group-hover:text-yellow-300 transition-colors">
                          {featuredBlog.title}
                        </h2>
                        <p className="text-white/60 text-xs mt-1">{featuredBlog.author || 'PicklePro'} | {format(new Date(featuredBlog.created_at), 'dd/MM/yyyy', { locale: vi })}</p>
                      </div>
                    </div>
                  </Link>
                )}

                {/* Mobile: show sidebar here */}
                {sidebarBlogs.length > 0 && (
                  <div className="space-y-1">
                    {sidebarBlogs.map(b => <ArticleRow key={b.id} blog={b} />)}
                  </div>
                )}
              </div>
            )}

            {/* Bottom Article Grid - 3 columns */}
            {gridBlogs.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                {gridBlogs.map(b => (
                  <ArticleMedium key={b.id} blog={b} />
                ))}
              </div>
            )}

            {blogs.length === 0 && !loading && (
              <div className="py-8 text-center text-gray-400 text-sm">
                Chưa có bài viết nào. Hãy thêm bài viết trong Admin → Bài viết.
              </div>
            )}
          </div>

          {/* ─── RIGHT SIDEBAR: Tin nổi bật ─── */}
          <div className="hidden lg:flex flex-col gap-6">
            {/* Hot label */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-red-500" />
                <span className="text-sm font-bold text-gray-800">Tin nổi bật</span>
              </div>
              <Link href="/blogs" className="text-xs text-indigo-500 hover:underline font-medium flex items-center gap-1">
                Xem thêm <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-1">
              {blogs.slice(0, 6).map(b => <ArticleRow key={b.id} blog={b} />)}
            </div>

            {/* Divider by category */}
            {(() => {
              const cats = [...new Set(blogs.map(b => b.category_name).filter(Boolean))]
              return cats.slice(0, 2).map(cat => {
                const catBlogs = blogs.filter(b => b.category_name === cat).slice(0, 3)
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-3 pt-4 border-t border-gray-100">
                      <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">{cat}</span>
                    </div>
                    <div className="space-y-1">
                      {catBlogs.map(b => <ArticleRow key={b.id} blog={b} />)}
                    </div>
                  </div>
                )
              })
            })()}
          </div>

        </div>
      </div>
    </section>
  )
}
