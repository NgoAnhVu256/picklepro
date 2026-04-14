"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"

interface Slide {
  id: string
  badge: string // position
  title: string
  bg_gradient: string // image_url
  href: string
  is_active: boolean
}

export function Hero() {
  const [current, setCurrent] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])
  const [loading, setLoading] = useState(true)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/slides')
        const data = await res.json()
        setSlides(data.slides?.filter((s: Slide) => s.is_active) ?? [])
      } catch (e) {}
      setLoading(false)
    }
    load()
  }, [])

  const heroSlides = slides.filter(s => !s.badge || s.badge === 'hero')
  const leftBanner = slides.find(s => s.badge === 'left')
  const right1Banner = slides.find(s => s.badge === 'right1')
  const right2Banner = slides.find(s => s.badge === 'right2')

  const effectiveHeroSlides = heroSlides.length > 0 ? heroSlides : [
     // Fallback if none so the slider doesn't break
     { id: 'fb', badge: 'hero', title: 'PicklePro Hero', bg_gradient: '/images/fallback.jpg', href: '/products', is_active: true }
  ]

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setCurrent(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  // Auto slide every 5s
  useEffect(() => {
    if (!emblaApi) return
    const timer = setInterval(() => { emblaApi.scrollNext() }, 5000)
    return () => clearInterval(timer)
  }, [emblaApi])

  const prev = () => emblaApi?.scrollPrev()
  const next = () => emblaApi?.scrollNext()
  const scrollTo = (i: number) => emblaApi?.scrollTo(i)

  if (loading) {
    return <section className="py-6 md:py-10"><div className="container mx-auto px-4"><div className="h-[360px] bg-gray-100 animate-pulse rounded-2xl" /></div></section>
  }

  return (
    <section className="relative overflow-hidden py-6 md:py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch" style={{ minHeight: '360px' }}>
          {/* Left Side Panel */}
          {leftBanner ? (
             <Link href={leftBanner.href || '#'} className="order-2 lg:order-1 lg:col-span-2 block w-full h-[160px] lg:h-full">
               <div className="relative h-full rounded-2xl overflow-hidden group cursor-pointer bg-gray-100">
                 {leftBanner.bg_gradient && leftBanner.bg_gradient.length > 0 ? (
                    <Image src={leftBanner.bg_gradient} alt={leftBanner.title || 'Left Banner'} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                    <div className="absolute inset-0 bg-gray-200" />
                 )}
                 {/* Dark overlay specifically for text readability if title exists */}
                 {leftBanner.title && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4 text-center">
                       <h3 className="text-white font-bold">{leftBanner.title}</h3>
                    </div>
                 )}
               </div>
             </Link>
          ) : (
             <div className="hidden lg:block order-2 lg:order-1 lg:col-span-2 rounded-2xl bg-gray-100" />
          )}

          {/* Center Banner Slider */}
          <div className="order-1 lg:order-2 lg:col-span-8 relative">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 h-full min-h-[260px] md:min-h-[360px] group" ref={emblaRef}>
              <div className="flex touch-pan-y cursor-grab active:cursor-grabbing w-full h-full">
                {effectiveHeroSlides.map((slide, idx) => (
                  <div key={slide.id || idx} className="relative flex-[0_0_100%] min-w-0 h-[260px] md:h-[360px] lg:h-full select-none">
                    {slide?.bg_gradient && slide.bg_gradient.length > 0 && (
                       <Image src={slide.bg_gradient} alt={slide.title || 'Hero Slide'} fill className="object-cover" draggable={false} priority={idx === 0} />
                    )}
                    
                    {/* Optional clickable overlay if it has a link */}
                    {slide?.href && (
                       <Link href={slide.href} className="absolute inset-0 z-10" draggable={false} />
                    )}

                    {slide?.title && (
                       <div className="absolute bottom-10 left-10 z-20 pointer-events-none">
                          <h2 className="text-2xl md:text-3xl lg:text-5xl font-black text-white drop-shadow-lg">{slide.title}</h2>
                       </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              {effectiveHeroSlides.length > 1 && (
                 <>
                   <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all z-20 opacity-0 group-hover:opacity-100">
                     <ChevronLeft className="h-5 w-5 text-gray-700 ml-[0.35rem]" />
                   </button>
                   <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all z-20 opacity-0 group-hover:opacity-100">
                     <ChevronRight className="h-5 w-5 text-gray-700 ml-1.5" />
                   </button>
                 </>
              )}

              {/* Dots */}
              {effectiveHeroSlides.length > 1 && (
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                   {effectiveHeroSlides.map((_, i) => (
                     <button key={i} onClick={() => scrollTo(i)}
                       className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'w-7 bg-[#c2e55c] shadow-md' : 'bg-white/50 hover:bg-white/70'}`} />
                   ))}
                 </div>
              )}
            </div>
          </div>

          {/* Right Side Panels */}
          <div className="order-3 flex lg:col-span-2 flex-row lg:flex-col gap-4">
             {/* Right 1 */}
             {right1Banner ? (
                <Link href={right1Banner.href || '#'} className="flex-1 relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-100 h-[100px] sm:h-[120px] lg:h-auto">
                   {right1Banner.bg_gradient && right1Banner.bg_gradient.length > 0 && (
                      <Image src={right1Banner.bg_gradient} alt={right1Banner.title || 'Right Banner 1'} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                   )}
                   {right1Banner.title && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center p-3">
                         <h4 className="font-bold text-white text-xs lg:text-sm">{right1Banner.title}</h4>
                      </div>
                   )}
                </Link>
             ) : (
                <div className="flex-1 rounded-2xl bg-gray-100 hidden lg:block" />
             )}
             
             {/* Right 2 */}
             {right2Banner ? (
                <Link href={right2Banner.href || '#'} className="flex-1 relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-100 h-[100px] sm:h-[120px] lg:h-auto">
                   {right2Banner.bg_gradient && right2Banner.bg_gradient.length > 0 && (
                      <Image src={right2Banner.bg_gradient} alt={right2Banner.title || 'Right Banner 2'} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                   )}
                   {right2Banner.title && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center p-3">
                         <h4 className="font-bold text-white text-xs lg:text-sm">{right2Banner.title}</h4>
                      </div>
                   )}
                </Link>
             ) : (
                <div className="flex-1 rounded-2xl bg-gray-100 hidden lg:block" />
             )}
          </div>
        </div>
      </div>
    </section>
  )
}

