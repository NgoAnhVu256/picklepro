'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Package, FolderOpen, ShoppingBag,
  Users, Settings, LogOut, Menu, X, ChevronRight, Store,
  Percent, UserCog, Sun, Moon
} from 'lucide-react'
import { useTheme } from 'next-themes'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/categories', label: 'Danh mục', icon: FolderOpen },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { href: '/admin/customers', label: 'Khách hàng', icon: Users },
  { href: '/admin/promotions', label: 'Khuyến mãi', icon: Percent },
  { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
  { href: '/admin/account', label: 'Tài khoản', icon: UserCog },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { theme, setTheme } = useTheme()
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-lime to-lime-dark flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-3xl">🏓</span>
          </div>
          <p className="text-gray-400 text-sm">Đang xác thực quyền admin...</p>
        </div>
      </div>
    )
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-full' : 'w-64'} h-full flex flex-col bg-gray-900 border-r border-gray-800`}>
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lime to-lime-dark flex items-center justify-center">
            <span className="text-lg">🏓</span>
          </div>
          <div>
            <p className="font-bold text-white text-sm">PicklePro</p>
            <p className="text-xs text-lime font-medium">Admin Dashboard</p>
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
                  ? 'bg-lime/20 text-lime border border-lime/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-lime' : 'text-gray-500 group-hover:text-gray-300'}`} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 text-lime" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
        >
          <Store className="h-5 w-5 text-gray-500" />
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
            className="absolute top-4 right-4 z-20 text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3 transition-colors">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-lime-dark hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
              title="Chuyển chế độ giao diện"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-400 ml-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-lime to-lime-dark flex items-center justify-center text-white text-xs font-bold">
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
