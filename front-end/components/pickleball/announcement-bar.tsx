'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Megaphone } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
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

interface AnnouncementBarProps {
  initialSlides?: Slide[]
}

export function AnnouncementBar({ initialSlides = [] }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true)
  const announcementOnly = initialSlides.filter(s => s.is_active && s.badge === 'announcement')
  const [slides, setSlides] = useState<Slide[]>(announcementOnly)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  const reloadSlides = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/slides')
      const data = await response.json()
      setSlides((data.slides ?? []).filter((s: Slide) => s.is_active && s.badge === 'announcement'))
    } catch {}
  }, [])

  useAdminRealtime({
    scopes: ['slides'],
    onChange: () => reloadSlides(),
  })

  useEffect(() => {
    if (!emblaApi || slides.length <= 1) return
    const timer = setInterval(() => {
      emblaApi.scrollNext()
    }, 4000)
    return () => clearInterval(timer)
  }, [emblaApi, slides.length])

  if (!isVisible) return null

  // Fallback — Không có slide announcement nào
  if (slides.length === 0) {
     return (
       <div className="sticky top-0 z-[60] w-full shadow-md transition-all duration-700 ease-in-out relative">
         <div
           className="py-3.5 px-12 w-full flex justify-center items-center gap-2.5 text-white font-bold text-sm"
           style={{ background: 'linear-gradient(90deg, #F97316, #EAB308)' }}
         >
           <Megaphone className="w-5 h-5 shrink-0" /> 
           <span className="text-center leading-snug">CHÀO MỪNG BẠN ĐẾN VỚI PICKLEPRO SHOP</span>
         </div>
         <button
           onClick={(e) => { e.preventDefault(); setIsVisible(false) }}
           className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/60 transition-colors z-[70]"
           aria-label="Đóng thông báo"
         >
           <X className="h-4 w-4" />
         </button>
       </div>
     )
  }

  return (
    <div className="sticky top-0 z-[60] w-full shadow-md transition-all duration-700 ease-in-out relative overflow-hidden" ref={emblaRef}>
      <div className="flex touch-pan-y cursor-grab active:cursor-grabbing w-full">
        {slides.map((slide, index) => {
           const content = slide.bg_gradient ? (
             <div className="w-full relative flex items-center justify-center" style={{ background: 'linear-gradient(90deg, #F97316, #EAB308)' }}>
               <Image
                 src={slide.bg_gradient}
                 alt={slide.title || "Announcement Banner"}
                 width={1200}
                 height={120}
                 className="w-full h-auto object-contain max-h-[120px]"
                 draggable={false}
                 priority
                 style={{ display: 'block' }}
               />
             </div>
           ) : (
             <div
               className="py-3.5 px-12 w-full flex justify-center items-center gap-2.5 text-white font-bold text-sm"
               style={{ background: 'linear-gradient(90deg, #F97316, #EAB308)' }}
             >
                <Megaphone className="w-5 h-5 shrink-0" /> 
                <span className="text-center leading-snug">{slide.title || 'Thông báo mới nhất từ PicklePro'}</span>
             </div>
           )

           return (
             <div key={slide.id || index} className="relative flex-[0_0_100%] min-w-0">
               {slide.href ? (
                 <Link href={slide.href} className="block w-full" draggable={false}>
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
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/60 transition-colors z-[70]"
        aria-label="Đóng thông báo"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
