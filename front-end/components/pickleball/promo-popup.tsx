'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'

const CATEGORY_BUTTONS = [
  { label: '🏓 Vợt', slug: 'vot-pickleball' },
  { label: '👟 Giày', slug: 'giay-the-thao' },
  { label: '👕 Quần Áo', slug: 'quan-ao' },
  { label: '🎒 Balo', slug: 'tui-balo' },
  { label: '🧤 Phụ kiện', slug: 'phu-kien-grip' },
]

export function PromoPopup() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Chỉ hiện 1 lần trong mỗi session
    const dismissed = sessionStorage.getItem('promo_popup_dismissed')
    if (!dismissed) {
      const timer = setTimeout(() => setShow(true), 1500) // Delay 1.5s để trang load xong
      return () => clearTimeout(timer)
    }
  }, [])

  const handleClose = () => {
    setShow(false)
    sessionStorage.setItem('promo_popup_dismissed', '1')
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={handleClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Popup */}
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-black/30 overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner Image Area */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#0c4a6e] flex items-center justify-center overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 w-20 h-20 bg-lime/20 rounded-full blur-2xl" />
          <div className="absolute bottom-4 right-8 w-16 h-16 bg-amber-500/20 rounded-full blur-xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl opacity-20">🏓</div>
          
          <div className="relative text-center px-6 z-10">
            <div className="inline-block px-3 py-1 rounded-full bg-lime/20 text-lime text-[10px] font-bold uppercase tracking-widest mb-3">
              Ưu đãi đặc biệt
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-2">
              Chào mừng đến với<br />
              <span className="bg-gradient-to-r from-lime via-emerald-400 to-lime bg-clip-text text-transparent">PicklePro</span>
            </h2>
            <p className="text-white/70 text-sm">Khám phá ngay bộ sưu tập mới nhất!</p>
          </div>
        </div>

        {/* Category Buttons */}
        <div className="p-5 sm:p-6">
          <p className="text-center text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Khám phá theo danh mục</p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {CATEGORY_BUTTONS.map(({ label, slug }) => (
              <Link
                key={slug}
                href={`/products?category=${slug}`}
                onClick={handleClose}
                className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-lime/10 border border-gray-100 hover:border-lime/40 text-gray-700 hover:text-lime-dark text-xs sm:text-sm font-bold transition-all active:scale-95"
              >
                {label}
              </Link>
            ))}
            <Link 
              href="/products"
              onClick={handleClose}
              className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-gradient-to-r from-lime-dark to-lime text-white text-xs sm:text-sm font-bold transition-all hover:opacity-90 active:scale-95 shadow-sm"
            >
              Xem tất cả
            </Link>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors z-10"
          aria-label="Đóng popup"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
