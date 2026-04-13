"use client"

import { Search, ShoppingCart, User, Menu, LogOut, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navItems = [
  { label: "VỢT PICKLEBALL", href: "/products?brand=", icon: "🏓" },
  { label: "PHỤ KIỆN", href: "/products", icon: "🎒" },
  { label: "BỘ SƯU TẬP", href: "/products", icon: "⭐" },
  { label: "KHUYẾN MÃI", href: "/products", icon: "🔥" },
  { label: "TIN TỨC", href: "#", icon: "📰" },
  { label: "CỘNG ĐỒNG", href: "#", icon: "👥" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const router = useRouter()
  const { getTotalItems } = useCart()

  // Defer cart count to client-side to prevent hydration mismatch
  const [totalItems, setTotalItems] = useState(0)
  useEffect(() => { setTotalItems(getTotalItems()) })

  useEffect(() => {
    const supabase = createClient()
    // Get current user + check admin role
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        // Dùng API route để tránh RLS conflict khi đọc role
        const res = await fetch('/api/auth/role')
        const { role } = await res.json()
        setIsAdmin(role === 'admin')
      } else {
        setIsAdmin(false)
      }
    }
    checkUser()
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setIsAdmin(false)
      else checkUser()
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setShowUserMenu(false)
    router.refresh()
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Glassmorphism Header */}
      <div className="backdrop-blur-xl bg-white/70 border-b border-lime/20 shadow-lg shadow-lime/5">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity">
              <Image
                src="/logo.png"
                alt="New Sport Logo"
                width={44}
                height={44}
                className="rounded-xl"
                priority
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-lime-dark to-lime bg-clip-text text-transparent">
                New Sport
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Tìm kiếm vợt, phụ kiện..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 rounded-full border-2 border-lime/30 focus:border-lime bg-white/80 backdrop-blur-sm"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-lime-dark hover:bg-lime-dark/80 text-white h-8 w-8"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Account Button */}
              {user ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 backdrop-blur-md bg-white/50 border border-lime/20 rounded-full px-3 py-1.5 hover:bg-lime/10 hover:border-lime/40 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-lime to-lime-dark flex items-center justify-center text-white text-xs font-bold">
                      {userInitial}
                    </div>
                    <span className="text-sm font-medium text-foreground max-w-[100px] truncate">{userName}</span>
                  </button>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white/95 backdrop-blur-xl border border-lime/20 rounded-2xl shadow-xl z-50 overflow-hidden">
                        {/* Admin link — chỉ hiện với role=admin */}
                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-lime-dark bg-lime/10 hover:bg-lime/20 transition-colors border-b border-lime/20"
                          >
                            <LayoutDashboard className="h-4 w-4 text-lime-dark" />
                            <span>🛠 Quản lý Admin</span>
                          </Link>
                        )}
                        <Link href="/account" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-lime/10 transition-colors">
                          <User className="h-4 w-4 text-lime-dark" /> Tài khoản
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
                          <LogOut className="h-4 w-4" /> Đăng xuất
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link href="/auth/login">
                  <Button
                    variant="ghost"
                    className="hidden sm:flex items-center gap-2 backdrop-blur-md bg-white/50 border border-lime/20 rounded-full px-4 py-2 hover:bg-lime/10 hover:border-lime/40 transition-all"
                  >
                    <User className="h-4 w-4 text-lime-dark" />
                    <span className="text-sm font-medium text-foreground">Tài khoản</span>
                  </Button>
                </Link>
              )}
              
              {/* Cart Button */}
              <Link href="/cart">
                <Button
                  className="flex items-center gap-2 backdrop-blur-md bg-lime-dark border border-lime-dark rounded-full px-4 py-2 hover:bg-lime-dark/90 text-white font-semibold shadow-lg shadow-lime-dark/20 transition-all"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-sm hidden sm:inline">Giỏ hàng</span>
                  <span className="bg-white text-lime-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden mt-3">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Tìm kiếm vợt, phụ kiện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-2 rounded-full border-2 border-lime/30 focus:border-lime bg-white/80"
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-lime-dark hover:bg-lime-dark/80 text-white h-7 w-7"
              >
                <Search className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        </div>

        {/* Navigation */}
        <nav className={`border-t border-lime/10 ${isMenuOpen ? 'block' : 'hidden md:block'}`}>
          <div className="container mx-auto px-4">
            <ul className="flex flex-col md:flex-row md:items-center md:justify-center gap-1 md:gap-0 py-2 md:py-0">
              {navItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 px-4 py-2.5 md:py-3 text-sm font-medium text-foreground/80 hover:text-lime-dark hover:bg-lime/10 rounded-lg md:rounded-none transition-all"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              {/* Mobile-only links */}
              <li className="md:hidden border-t border-lime/10 mt-1 pt-1">
                {user ? (
                  <>
                    <Link href="/account" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground/80 hover:text-lime-dark hover:bg-lime/10 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                      <User className="h-4 w-4" /> Tài khoản ({userName})
                    </Link>
                    {isAdmin && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-lime-dark hover:bg-lime/10 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                        <LayoutDashboard className="h-4 w-4" /> 🛠 Quản lý Admin
                      </Link>
                    )}
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false) }} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg w-full">
                      <LogOut className="h-4 w-4" /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link href="/auth/login" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-lime-dark hover:bg-lime/10 rounded-lg" onClick={() => setIsMenuOpen(false)}>
                    <User className="h-4 w-4" /> Đăng nhập / Đăng ký
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  )
}
