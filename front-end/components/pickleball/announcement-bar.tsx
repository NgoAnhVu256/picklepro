'use client'

import { useState, useEffect } from 'react'
import { X, Megaphone } from 'lucide-react'
import Link from 'next/link'

interface Slide {
  id: string
  bg_gradient: string
  href: string
  is_active: boolean
  badge: string
  title?: string
}

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    fetch('/api/admin/slides')
      .then(r => r.json())
      .then(data => {
        const active = (data.slides ?? [])
          .filter((s: Slide) => s.is_active && s.badge === 'announcement')
          // Sort by order or just leave as is since API returns ordered
        setSlides(active)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return

    const timer = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length)
        setFade(true)
      }, 300)
    }, 4000)

    return () => clearInterval(timer)
  }, [slides.length])

  if (!isVisible) return null

  const currentSlide = slides.length > 0 ? slides[currentIndex] : null
  const imageSrc = currentSlide?.bg_gradient

  const content = slides.length > 0 ? (
    <div className={`relative w-full max-h-[80px] sm:max-h-[100px] overflow-hidden bg-black transition-opacity duration-300 flex items-center justify-center ${fade ? 'opacity-100' : 'opacity-0'}`}>
       {imageSrc ? (
         <img src={imageSrc} alt={currentSlide?.title || "Announcement Banner"} className="w-full h-full object-cover max-h-[80px] sm:max-h-[100px]" />
       ) : (
         <div className="py-3 px-4 w-full flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold text-sm">
            <Megaphone className="w-4 h-4" /> {currentSlide?.title || 'Thông báo mới nhất từ PicklePro'}
         </div>
       )}
    </div>
  ) : (
    <div className="py-2.5 px-4 w-full flex justify-center items-center gap-2 text-white font-bold text-sm transition-opacity duration-300" style={{ background: 'linear-gradient(90deg, #F97316, #EAB308)' }}>
      <Megaphone className="w-4 h-4" /> CHÀO MỪNG BẠN ĐẾN VỚI PICKLEPRO SHOP
    </div>
  )

  return (
    <div className="sticky top-0 z-[60] w-full shadow-md transition-all duration-700 ease-in-out">
      {currentSlide?.href ? (
        <Link href={currentSlide.href} className="block w-full">
          {content}
        </Link>
      ) : (
        content
      )}
      
      {/* Close button */}
      <button
        onClick={(e) => { e.preventDefault(); setIsVisible(false) }}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors z-[70]"
        aria-label="Đóng thông báo"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
