'use client'

import { useWishlist } from '@/hooks/use-wishlist'
import Link from 'next/link'
import { HeartOff, ArrowRight, User, Package, LogOut, Camera, Shield, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function WishlistPage() {
  const { items, removeItem } = useWishlist()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  
  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => {
       if (d.user) setProfile({ ...d.user, orderCount: d.stats?.orderCount || 0 })
    }).catch(e => {})
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f8fafc] to-[#f1f5f9]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="text-center p-6 rounded-3xl border border-lime/20 bg-gradient-to-b from-lime/5 to-transparent">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-lime to-lime-dark flex items-center justify-center text-4xl shadow-xl">
                    {profile?.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-white text-3xl font-bold">{(profile?.fullName || 'U').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </div>
                <h3 className="font-bold text-foreground">{profile?.fullName || 'Người dùng'}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Đơn hàng', value: String(profile?.orderCount || 0), icon: Package, color: 'from-lime to-lime-dark' },
                  { label: 'Yêu thích', value: String(items.length), icon: Shield, color: 'from-pink-400 to-red-400' },
                  { label: 'Điểm thưởng', value: '0', icon: Bell, color: 'from-amber-400 to-orange-400' },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="text-center p-3 rounded-2xl border border-lime/10 bg-gradient-to-b from-lime/5 to-transparent">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${color} mb-1`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>

              <nav className="rounded-2xl border border-lime/10 overflow-hidden bg-white">
                {[
                  { href: '/account', label: 'Thông tin cá nhân', icon: User, active: false },
                  { href: '/account/orders', label: 'Đơn hàng của tôi', icon: Package, active: false },
                  { href: '/account/wishlist', label: 'Sản phẩm yêu thích', icon: Shield, active: true },
                ].map(({ href, label, icon: Icon, active }) => (
                  <Link key={href} href={href} className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${active ? 'bg-lime/10 text-lime-dark border-l-3 border-lime-dark' : 'text-muted-foreground hover:bg-muted/50'}`}>
                    <Icon className="h-4 w-4" /> {label}
                  </Link>
                ))}
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 w-full transition-colors">
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-lime/20 shadow-sm bg-gradient-to-b from-lime/5 to-transparent">
              <div className="mb-6 pb-4 border-b border-lime/10">
                <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
                  Danh sách yêu thích
                  <span className="bg-red-50 text-red-500 text-sm py-0.5 px-2 rounded-full font-bold">{items.length}</span>
                </h2>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                    <HeartOff className="w-8 h-8 text-gray-300" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Chưa có sản phẩm yêu thích</h2>
                  <p className="text-gray-500 mb-6">Hãy thêm những sản phẩm bạn yêu thích vào danh sách để tiện theo dõi nhé.</p>
                  <Link href="/products">
                    <Button className="rounded-full font-bold px-8 bg-gradient-to-r from-lime-dark to-lime text-white border-0 hover:opacity-90 transition-all shadow-lg shadow-lime/20">
                      Đi mua sắm ngay <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-red-100 bg-white hover:bg-red-50/30 transition-all group relative">
                      <Link href={`/products/${item.slug}`} className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </Link>
                      
                      <div className="flex-1 min-w-0 pr-8">
                        <Link href={`/products/${item.slug}`}>
                          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-red-500 transition-colors">{item.name}</h3>
                        </Link>
                        <div className="font-bold text-lime-dark text-sm">
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          removeItem(item.productId)
                          toast("Đã bỏ khỏi danh sách yêu thích")
                        }}
                        className="absolute top-4 right-4 p-1.5 rounded-full text-gray-300 hover:text-red-500 hover:bg-white bg-transparent transition-all shadow-sm"
                        title="Xóa"
                      >
                        <HeartOff className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
