'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Package, Tag, ShoppingCart,
  Users, Settings, LogOut, Menu, X, ChevronRight, Store,
  Percent, UserCog, Newspaper, SlidersHorizontal, Megaphone,
  BadgePercent, Star, TrendingUp
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Tổng quan', icon: TrendingUp, exact: true },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/categories', label: 'Danh mục', icon: Tag },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { href: '/admin/customers', label: 'Khách hàng', icon: Users },
  { href: '/admin/promotions', label: 'Khuyến mãi', icon: BadgePercent },
  { href: '/admin/blogs', label: 'Bài viết', icon: Newspaper },
  { href: '/admin/slides', label: 'Quản lý Banners', icon: SlidersHorizontal },
  { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
  { href: '/admin/account', label: 'Tài khoản', icon: UserCog },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    async function verify() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth/login?redirect=/admin'); return }

      // Verify admin role qua API
      const verifyRes = await fetch('/api/admin/stats')
      if (verifyRes.status === 403) {
        router.replace('/?error=unauthorized')
        return
      }
      setUser(user)
      setLoading(false)
    }
    verify()
  }, [router])

  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.replace('/')
  }

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-[#bae6fd] flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <div className="w-[55vw] max-w-[380px] aspect-square relative mb-6 drop-shadow-2xl">
            <Image src="/logo.png" alt="PicklePro" fill className="object-contain" priority unoptimized />
          </div>
          <div className="flex items-center gap-2 text-sky-600">
            <div className="w-4 h-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
            <p className="text-sm font-medium">Đang xác thực quyền admin...</p>
          </div>
        </div>
      </div>
    )
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-full' : 'w-64'} h-full flex flex-col bg-card text-card-foreground shadow-sm border-r border-border`}>
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-white shrink-0 shadow-sm border border-border">
            <Image src="/logo.png" alt="PicklePro" width={40} height={40} className="object-cover" unoptimized />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">PicklePro</p>
            <p className="text-xs text-lime-dark font-medium">Admin Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                active
                  ? 'bg-lime-dark/10 text-lime-dark border border-lime-dark/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-lime-dark' : 'text-muted-foreground group-hover:text-secondary-foreground'}`} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 text-lime-dark" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <Store className="h-5 w-5 text-muted-foreground" />
          <span>Xem cửa hàng</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 w-72 h-full">
            <Sidebar mobile />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 z-20 text-foreground"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen min-w-0 w-full lg:w-[calc(100%-16rem)] overflow-x-hidden">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-card text-card-foreground shadow-sm/80 backdrop-blur-xl border-b border-gray-200 dark:border-border px-4 py-3 flex items-center gap-3 transition-colors">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />

          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-muted-foreground ml-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime to-lime-dark flex items-center justify-center text-foreground text-xs font-bold">
              {user?.email?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
            <span className="hidden sm:block max-w-[120px] truncate">{user?.email}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
