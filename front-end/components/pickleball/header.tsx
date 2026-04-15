"use client"

import { Search, ShoppingCart, User, Menu, LogOut, LayoutDashboard, Target, Package, Layers, Newspaper, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { useCart } from "@/hooks/use-cart"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

const navItems = [
  { label: "VỢT PICKLEBALL", href: "/products?category=vot-pickleball", icon: Target, gradId: "grad-vot", gradient: "linear-gradient(135deg, #FF6B6B, #FF8E53)", from: "#FF6B6B", to: "#FF8E53" },
  { label: "PHỤ KIỆN", href: "/products?category=phu-kien", icon: Package, gradId: "grad-pk", gradient: "linear-gradient(135deg, #5054FE, #9B56FF)", from: "#5054FE", to: "#9B56FF" },
  { label: "BỘ SƯU TẬP", href: "/products", icon: Layers, gradId: "grad-bst", gradient: "linear-gradient(135deg, #F7971E, #FFD200)", from: "#F7971E", to: "#FFD200" },
  { label: "TIN TỨC", href: "/#home-blog-section", icon: Newspaper, gradId: "grad-news", gradient: "linear-gradient(135deg, #11998E, #38EF7D)", from: "#11998E", to: "#38EF7D" },
  { label: "CỘNG ĐỒNG", href: "https://www.facebook.com/profile.php?id=61575468045037", icon: Users, gradId: "grad-community", gradient: "linear-gradient(135deg, #667EEA, #764BA2)", from: "#667EEA", to: "#764BA2" },
]

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeTab, setActiveTab] = useState(-1)
  const router = useRouter()
  const { getTotalItems } = useCart()

  const [totalItems, setTotalItems] = useState(0)
  useEffect(() => { setTotalItems(getTotalItems()) })

  useEffect(() => {
    const supabase = createClient()
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const res = await fetch('/api/auth/role')
        const { role } = await res.json()
        setIsAdmin(role === 'admin')
      } else {
        setIsAdmin(false)
      }
    }
    checkUser()
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
    <header className="relative z-50 w-full">
      <div className="bg-white border-b border-lime/20 shadow-lg shadow-lime/5">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo — BIGGER */}
            <Link href="/" className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity">
              <Image src="/favicon.ico" alt="PicklePro Logo" width={80} height={80} className="rounded-xl" priority unoptimized />
              <span className="text-3xl font-bold text-black">
                PicklePro
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full drop-shadow-sm">
                <Input type="text" placeholder="Gõ từ khóa bạn cần tìm kiếm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-6 pr-12 py-6 rounded-full border-0 bg-[#F4F5F7] text-gray-800 focus-visible:ring-1 focus-visible:ring-lime placeholder:text-gray-500 text-[15px]" />
                <Button type="submit" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full bg-[#0B0A11] hover:bg-[#0B0A11]/90 text-white h-9 w-9">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <div className="relative">
                  <button onClick={() => setShowUserMenu(!showUserMenu)}
                    className="hidden sm:flex items-center gap-2 backdrop-blur-md bg-white/50 border border-lime/20 rounded-full px-4 py-2 hover:bg-lime/10 hover:border-lime/40 transition-all">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg, #5054FE, #9B56FF)' }}>
                      {userInitial}
                    </span>
                    <span className="text-sm font-medium text-foreground max-w-[100px] truncate">{userName}</span>
                  </button>
                  {showUserMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                      <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-lime/20 overflow-hidden z-50">
                        {isAdmin && (
                          <Link href="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-lime-dark hover:bg-lime/10 transition-colors">
                            <LayoutDashboard className="h-4 w-4" /> 🛠 Admin
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
                  <Button variant="ghost" className="hidden sm:flex items-center gap-2 backdrop-blur-md bg-white/50 border border-lime/20 rounded-full px-4 py-2 hover:bg-lime/10 hover:border-lime/40 transition-all">
                    <User className="h-4 w-4 text-lime-dark" />
                    <span className="text-sm font-medium text-foreground">Tài khoản</span>
                  </Button>
                </Link>
              )}

              {/* Cart Button — Purple gradient */}
              <Link href="/cart">
                <Button className="flex items-center gap-2 backdrop-blur-md text-white font-semibold rounded-full px-4 py-2 shadow-lg shadow-purple-500/20 transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #B27BFF, #9A57FF)' }}>
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-sm hidden sm:inline">Giỏ hàng</span>
                  <span className="bg-white text-[#9A57FF] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{totalItems}</span>
                </Button>
              </Link>

              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden mt-3 mx-4 pb-2">
            <div className="relative w-full drop-shadow-sm">
              <Input type="text" placeholder="Gõ từ khóa bạn cần tìm kiếm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-5 pr-12 py-5 rounded-full border-0 bg-[#F4F5F7] text-gray-800 focus-visible:ring-1 focus-visible:ring-lime placeholder:text-gray-500 text-[14px]" />
              <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[#0B0A11] hover:bg-[#0B0A11]/90 text-white h-8 w-8">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Navigation — Underline active/hover style */}
        <nav className={`border-t border-lime/10 bg-white ${isMenuOpen ? 'block' : 'hidden md:block'}`}>
          <div className="container mx-auto px-4">
            
            {/* SVG Gradients for Icons */}
            <svg width="0" height="0" className="absolute w-0 h-0 pointer-events-none">
              <defs>
                {navItems.map(item => (
                  <linearGradient key={item.gradId} id={item.gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={item.from} />
                    <stop offset="100%" stopColor={item.to} />
                  </linearGradient>
                ))}
              </defs>
            </svg>

            <ul className="flex flex-col md:flex-row md:items-center md:justify-center gap-0 py-0">
              {navItems.map((item, index) => {
                const isActive = activeTab === index
                const Icon = item.icon
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="group relative flex items-center gap-2 px-5 py-3.5"
                      onClick={() => { setActiveTab(index); setIsMenuOpen(false) }}
                    >
                      {/* Icon */}
                      <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-black' : 'text-gray-600 group-hover:text-black'}`} />
                      
                      {/* Label - Black and Bold */}
                      <span className={`text-[15px] transition-colors duration-200 font-bold ${isActive ? 'text-black' : 'text-black/80 group-hover:text-black'}`}>
                        {item.label}
                      </span>
                      
                      {/* Underline */}
                      <span className={`absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-black transition-all duration-300 ${
                        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                    </Link>
                  </li>
                )
              })}
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
