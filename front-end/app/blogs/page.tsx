'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Calendar, Clock, Tag, Mail, BookOpen, Trophy, Wrench } from 'lucide-react'
import Link from 'next/link'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  thumbnail_url: string | null
  category: string | null
  created_at: string
  reading_time?: number
}

const CATEGORIES = [
  { key: 'all', label: 'Tất cả', icon: BookOpen, color: 'from-gray-700 to-gray-900' },
  { key: 'ky-thuat', label: 'Kỹ thuật & Luật chơi', icon: BookOpen, color: 'from-blue-500 to-indigo-600' },
  { key: 'review', label: 'Review thiết bị', icon: Wrench, color: 'from-amber-500 to-orange-600' },
  { key: 'giai-dau', label: 'Tin tức giải đấu', icon: Trophy, color: 'from-emerald-500 to-teal-600' },
]

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default function BlogsPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    fetch('/api/blogs')
      .then(r => r.json())
      .then(d => setPosts(d.blogs ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter(p => p.category === activeCategory)

  const featuredPost = filteredPosts[0]
  const remainingPosts = filteredPosts.slice(1)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 5000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f8fafc] to-[#f1f5f9]">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative py-14 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500/40 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 relative text-center">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">
              PicklePro Magazine
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3">
              Tin Tức & Kiến Thức Pickleball
            </h1>
            <p className="text-white/60 text-base max-w-2xl mx-auto">
              Cập nhật kiến thức chuyên sâu, review thiết bị và tin tức giải đấu mới nhất trong thế giới Pickleball
            </p>
          </div>
        </section>

        {/* Category Tabs */}
        <div className="container mx-auto px-4 -mt-6 relative z-10">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                  activeCategory === cat.key
                    ? 'bg-white text-gray-900 shadow-lg'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <span className="text-6xl block mb-4">📝</span>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có bài viết nào</h3>
              <p className="text-gray-500">Hãy quay lại sau để xem các bài viết mới nhất.</p>
            </div>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && (
                <Link href={`/blogs/${featuredPost.slug}`} className="group block mb-10">
                  <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 min-h-[280px] sm:min-h-[360px] flex items-end shadow-xl hover:shadow-2xl transition-all">
                    {featuredPost.thumbnail_url && (
                      <img src={featuredPost.thumbnail_url} alt={featuredPost.title} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="relative p-6 sm:p-10 max-w-3xl">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3 border border-blue-500/20">
                        Bài viết nổi bật
                      </span>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 leading-tight group-hover:text-blue-200 transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-white/70 text-sm sm:text-base line-clamp-2 mb-4">
                        {featuredPost.excerpt || 'Đọc bài viết để tìm hiểu thêm...'}
                      </p>
                      <div className="flex items-center gap-4 text-white/50 text-xs">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(featuredPost.created_at)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 5 phút đọc</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Post Grid */}
              {remainingPosts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remainingPosts.map(post => (
                    <Link key={post.id} href={`/blogs/${post.slug}`} className="group block">
                      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                        <div className="relative h-44 bg-gray-100 overflow-hidden">
                          {post.thumbnail_url ? (
                            <img src={post.thumbnail_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-4xl">📰</div>
                          )}
                          {post.category && (
                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-700 uppercase tracking-wider shadow-sm">
                              {CATEGORIES.find(c => c.key === post.category)?.label || post.category}
                            </span>
                          )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-bold text-gray-900 text-base line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">
                            {post.excerpt || 'Đọc bài viết để tìm hiểu thêm...'}
                          </p>
                          <div className="flex items-center gap-3 text-gray-400 text-xs mt-auto pt-3 border-t border-gray-50">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Newsletter Subscribe */}
        <section className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] py-16 mt-8">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/20 text-blue-400 mb-5">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Đăng ký nhận bản tin</h2>
            <p className="text-white/60 text-sm mb-6">
              Nhận ngay thông tin mới nhất về kỹ thuật chơi, đánh giá sản phẩm và ưu đãi độc quyền mỗi tuần
            </p>
            {subscribed ? (
              <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-xl px-6 py-4 text-emerald-400 font-bold text-sm">
                ✅ Đăng ký thành công! Cảm ơn bạn đã theo dõi PicklePro.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="flex-1 h-12 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-blue-500"
                />
                <Button type="submit" className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 shadow-lg active:scale-95 transition-all">
                  Đăng ký <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
