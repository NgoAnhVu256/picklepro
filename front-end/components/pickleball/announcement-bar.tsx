'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Megaphone } from 'lucide-react'
import Link from 'next/link'
import useEmblaCarousel from 'embla-carousel-react'
import { useAdminRealtime } from '@/hooks/use-admin-realtime'

interface Slide {
  id: string
  bg_gradient: string
  href: string
  is_active: boolean
  badge: string
  title?: string
}

export function AnnouncementBar({ initialSlides }: { initialSlides?: any[] } = {}) {
  const [isVisible, setIsVisible] = useState(true)
  const [slides, setSlides] = useState<Slide[]>(
    (initialSlides ?? []).filter((s: any) => s.is_active && s.badge === 'announcement')
  )
  const [announcementEnabled, setAnnouncementEnabled] = useState(true)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        if (data.settings && data.settings.announcement_enabled === false) {
          setAnnouncementEnabled(false)
        } else {
          setAnnouncementEnabled(true)
        }
      }
    } catch {}
  }, [])

  const loadSlides = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/slides')
      const data = await response.json()
      const active = (data.slides ?? [])
        .filter((s: Slide) => s.is_active && s.badge === 'announcement')
      setSlides(active)
    } catch {}
  }, [])

  useEffect(() => {
    loadSettings()
    loadSlides()
    const interval = setInterval(loadSlides, 15000)
    return () => clearInterval(interval)
  }, [loadSettings, loadSlides])

  useAdminRealtime({
    scopes: ['slides'],
    onChange: () => {
      loadSlides()
      loadSettings()
    },
  })

  useEffect(() => {
    if (!emblaApi || slides.length <= 1) return
    const timer = setInterval(() => {
      emblaApi.scrollNext()
    }, 4000)
    return () => clearInterval(timer)
  }, [emblaApi, slides.length])

  if (!isVisible || !announcementEnabled) return null

  // CSS cho marquee animation trên mobile
  const marqueeCSS = `
    @keyframes marquee-scroll {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
  `

  // Fallback nếu không có slides
  if (slides.length === 0) {
    return (
      <div className="sticky top-0 z-[60] w-full transition-all duration-500 relative">
        <style dangerouslySetInnerHTML={{ __html: marqueeCSS }} />
        <div className="w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500">
          {/* Desktop: centered text */}
          <div className="hidden sm:flex h-9 items-center justify-center gap-2 text-white font-bold text-xs px-4">
            <Megaphone className="w-3.5 h-3.5 shrink-0" />
            <span>CHÀO MỪNG BẠN ĐẾN VỚI PICKLEPRO SHOP — Miễn phí vận chuyển đơn từ 500K</span>
          </div>
          {/* Mobile: marquee text */}
          <div className="sm:hidden h-8 overflow-hidden flex items-center">
            <span className="whitespace-nowrap text-white font-bold text-xs inline-block" style={{ animation: 'marquee-scroll 12s linear infinite' }}>
              🏓 CHÀO MỪNG BẠN ĐẾN VỚI PICKLEPRO SHOP — Miễn phí vận chuyển đơn từ 500K 🏓 Giảm giá lên đến 30% cho Vợt JOOLA 🏓
            </span>
          </div>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); setIsVisible(false) }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/30 text-white/80 hover:bg-black/60 transition-colors z-[70]"
          aria-label="Đóng thông báo"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    )
  }

  return (
    <div className="sticky top-0 z-[60] w-full transition-all duration-500 relative">
      <style dangerouslySetInnerHTML={{ __html: marqueeCSS }} />

      {/* Desktop: Embla Carousel */}
      <div className="hidden sm:block w-full" ref={emblaRef}>
        <div className="flex touch-pan-y w-full">
          {slides.map((slide, index) => {
            const content = slide.bg_gradient ? (
              <div className="w-full" style={{ backgroundImage: `url('${slide.bg_gradient}')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', height: '44px' }}
                   title={slide.title || "Announcement Banner"} />
            ) : (
              <div className="h-[44px] w-full flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold text-xs">
                <Megaphone className="w-3.5 h-3.5 shrink-0" />
                <span>{slide.title || 'Thông báo mới nhất từ PicklePro'}</span>
              </div>
            )
            return (
              <div key={slide.id || index} className="relative flex-[0_0_100%] min-w-0">
                {slide.href ? (
                  <Link href={slide.href} className="block w-full" draggable={false}>{content}</Link>
                ) : content}
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile: Marquee chạy ngang */}
      <div className="sm:hidden w-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 h-8 overflow-hidden flex items-center">
        <div className="whitespace-nowrap inline-flex items-center gap-8" style={{ animation: 'marquee-scroll 15s linear infinite' }}>
          {slides.map((slide, i) => (
            <span key={slide.id || i} className="text-white font-bold text-xs inline-flex items-center gap-1.5">
              <Megaphone className="w-3 h-3 shrink-0" />
              {slide.href ? (
                <Link href={slide.href} className="text-white hover:underline">{slide.title || 'Ưu đãi đặc biệt'}</Link>
              ) : (
                <span>{slide.title || 'Ưu đãi đặc biệt'}</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.preventDefault(); setIsVisible(false) }}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/30 text-white/80 hover:bg-black/60 transition-colors z-[70]"
        aria-label="Đóng thông báo"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  )
}
