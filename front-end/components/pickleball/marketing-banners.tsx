"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"

interface Slide {
  id: string
  title: string
  bg_gradient: string
  href: string
  is_active: boolean
}

export function MarketingBanners() {
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/slides')
        const data = await res.json()
        setSlides(data.slides?.filter((s: Slide) => s.is_active && s.badge === 'marketing') ?? [])
      } catch (e) {}
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <section className="py-6 md:py-10 bg-[#0B0A11] border-t border-border/10">
        <div className="container mx-auto px-4 flex gap-4 overflow-x-hidden">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="w-[280px] h-[450px] shrink-0 bg-gray-800/50 animate-pulse rounded-2xl" />
          ))}
        </div>
      </section>
    )
  }

  const effectiveSlides = slides.length > 0 ? slides : [
    { id: 'fb1', title: 'PicklePro Pro', bg_gradient: '/images/banner1.png', href: '/products', is_active: true },
    { id: 'fb2', title: 'Power Series', bg_gradient: '/images/banner2.png', href: '/products', is_active: true }
  ]

  return (
    <section className="pt-4 pb-10 bg-[#0a0a0c] border-t border-border/10">
      <div className="container mx-auto px-4 max-w-[1200px]">
        {/* Horizontal Scroll Carousel */}
        <div className="flex overflow-x-auto hide-scrollbar gap-4 md:gap-6 snap-x snap-mandatory">
          {effectiveSlides.map((slide, index) => (
            <Link 
              key={slide.id || index} 
              href={slide.href || '#'} 
              className="relative w-[280px] md:w-[320px] h-[450px] md:h-[500px] shrink-0 snap-center group overflow-hidden rounded-[2rem] shadow-2xl shadow-lime/5 border border-white/10 bg-black"
            >
              {slide.bg_gradient && slide.bg_gradient.length > 0 && (
                <Image 
                  src={slide.bg_gradient} 
                  alt={slide.title || 'Marketing Banner'} 
                  fill 
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100" 
                />
              )}
              
              {/* Neon Glow Overlay Effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-lime-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {slide.title && (
                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight drop-shadow-md">
                    {slide.title}
                  </h3>
                  <div className="w-8 h-1 bg-lime mt-3 rounded-full group-hover:w-16 transition-all duration-300" />
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

