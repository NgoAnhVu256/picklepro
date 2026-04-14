"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"

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
  const [emblaRef] = useEmblaCarousel({ dragFree: true, containScroll: 'trimSnaps' })

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
      <section className="py-6 md:py-10 bg-white border-t border-border/10">
        <div className="container mx-auto px-4 max-w-[1200px]">
          <div className="overflow-hidden">
            <div className="flex flex-nowrap gap-3 md:gap-4 lg:gap-6 pb-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-[150px] sm:w-[200px] md:w-[240px] lg:w-[calc(20%-1.2rem)] aspect-[9/16] lg:aspect-[10/16] flex-[0_0_auto] bg-gray-100 animate-pulse rounded-[1.5rem] md:rounded-[2rem]" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const effectiveSlides = slides.length > 0 ? slides : [
    { id: 'fb1', title: 'PicklePro Pro', bg_gradient: '/images/banner1.png', href: '/products', is_active: true },
    { id: 'fb2', title: 'Power Series', bg_gradient: '/images/banner2.png', href: '/products', is_active: true }
  ]

  return (
    <section className="pt-4 pb-10 bg-white border-t border-border/10">
      <div className="container mx-auto px-4 max-w-[1200px]">
        {/* Horizontal Scroll Carousel */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex flex-nowrap gap-3 md:gap-4 lg:gap-6 pb-4 cursor-grab active:cursor-grabbing">
            {effectiveSlides.map((slide, index) => (
              <div key={slide.id || index} className="w-[150px] sm:w-[200px] md:w-[240px] lg:w-[calc(20%-1.2rem)] aspect-[9/16] lg:aspect-[10/16] flex-[0_0_auto]">
                <Link 
                  href={slide.href || '#'} 
                  className="relative w-full h-full block group overflow-hidden rounded-[1.5rem] md:rounded-[2rem] shadow-md hover:shadow-xl hover:shadow-lime/10 border border-black/5 bg-white hover:-translate-y-1 transition-all duration-300 select-none"
                  draggable={false}
                >
              {slide.bg_gradient && slide.bg_gradient.length > 0 && (
                <Image 
                  src={slide.bg_gradient} 
                  alt={slide.title || 'Marketing Banner'} 
                  fill 
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                />
              )}

              {slide.title && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight drop-shadow-sm line-clamp-2">
                      {slide.title}
                    </h3>
                    <div className="w-8 h-1 bg-lime mt-3 rounded-full group-hover:w-16 transition-all duration-300" />
                  </div>
                </>
              )}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

