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

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true)
  const [slides, setSlides] = useState<Slide[]>([])
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const loadSlides = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/slides')
      const data = await response.json()
      const active = (data.slides ?? [])
        .filter((s: Slide) => s.is_active && s.badge === 'announcement')
      setSlides(active)
    } catch {
      // Ignore transient fetch errors.
    }
  }, [])

  useEffect(() => {
    loadSlides()
    const interval = setInterval(loadSlides, 15000)
    return () => clearInterval(interval)
  }, [loadSlides])

  useAdminRealtime({
    scopes: ['slides'],
    onChange: () => {
      loadSlides()
    },
  })

  useEffect(() => {
    if (!emblaApi || slides.length <= 1) return
    const timer = setInterval(() => {
      emblaApi.scrollNext()
    }, 4000)
    return () => clearInterval(timer)
  }, [emblaApi, slides.length])

  if (!isVisible) return null

  // Fallback state
  if (slides.length === 0) {
     return (
       <div className="sticky top-0 z-[60] w-full shadow-md transition-all duration-700 ease-in-out">
         <div className="py-4 sm:py-2.5 px-6 sm:px-4 w-[92%] sm:w-full mx-auto flex justify-center items-center gap-2 text-white font-bold text-sm sm:text-sm rounded-b-xl sm:rounded-none" style={{ background: 'linear-gradient(90deg, #F97316, #EAB308)' }}>
           <Megaphone className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" /> 
           <span className="text-center leading-snug">CHÀO MỪNG BẠN ĐẾN VỚI PICKLEPRO SHOP</span>
         </div>
         <button
           onClick={(e) => { e.preventDefault(); setIsVisible(false) }}
           className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors z-[70]"
           aria-label="Đóng thông báo"
         >
           <X className="h-4 w-4" />
         </button>
       </div>
     )
  }

  return (
    <div className="sticky top-0 z-[60] w-full shadow-md transition-all duration-700 ease-in-out relative overflow-hidden bg-black" ref={emblaRef}>
      <div className="flex touch-pan-y cursor-grab active:cursor-grabbing w-full">
        {slides.map((slide, index) => {
           const content = slide.bg_gradient ? (
             <div className="w-full mx-auto">
               <img src={slide.bg_gradient} alt={slide.title || "Announcement Banner"} className="w-full h-[100px] sm:h-auto sm:max-h-[120px] object-cover object-center" draggable={false} />
             </div>
           ) : (
             <div className="py-4 sm:py-3 px-6 sm:px-4 w-[92%] sm:w-full mx-auto flex justify-center items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold text-sm rounded-b-xl sm:rounded-none">
                <Megaphone className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" /> 
                <span className="text-center leading-snug">{slide.title || 'Thông báo mới nhất từ PicklePro'}</span>
             </div>
           )

           return (
             <div key={slide.id || index} className="relative flex-[0_0_100%] min-w-0">
               {slide.href ? (
                 <Link href={slide.href} className="block w-full h-full" draggable={false}>
                   {content}
                 </Link>
               ) : (
                 content
               )}
             </div>
           )
        })}
      </div>
      
      {/* Close button */}
      <button
        onClick={(e) => { e.preventDefault(); setIsVisible(false) }}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors z-[70]"
        aria-label="Đóng thông báo"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )

}
