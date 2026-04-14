"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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

  // Auto slide every 5s
  useEffect(() => {
    if (effectiveHeroSlides.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % effectiveHeroSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [effectiveHeroSlides.length])

  const prev = () => setCurrent((c) => (c - 1 + effectiveHeroSlides.length) % effectiveHeroSlides.length)
  const next = () => setCurrent((c) => (c + 1) % effectiveHeroSlides.length)

  const slide = effectiveHeroSlides[current]

  if (loading) {
    return <section className="py-6 md:py-10"><div className="container mx-auto px-4"><div className="h-[360px] bg-gray-100 animate-pulse rounded-2xl" /></div></section>
  }

  return (
    <section className="relative overflow-hidden py-6 md:py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch" style={{ minHeight: '360px' }}>
          {/* Left Side Panel */}
          {leftBanner ? (
             <Link href={leftBanner.href || '#'} className="hidden lg:block lg:col-span-2">
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
             <div className="hidden lg:block lg:col-span-2 rounded-2xl bg-gray-100" />
          )}

          {/* Center Banner Slider */}
          <div className="lg:col-span-8 relative">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 transition-all duration-500 h-full min-h-[360px] group">
              {slide?.bg_gradient && slide.bg_gradient.length > 0 && (
                 <Image src={slide.bg_gradient} alt={slide.title || 'Hero Slide'} fill className="object-cover" />
              )}
              
              {/* Optional clickable overlay if it has a link */}
              {slide?.href && (
                 <Link href={slide.href} className="absolute inset-0 z-10" />
              )}

              {slide?.title && (
                 <div className="absolute bottom-10 left-10 z-20 pointer-events-none">
                    <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">{slide.title}</h2>
                 </div>
              )}

              {/* Navigation Arrows */}
              {effectiveHeroSlides.length > 1 && (
                 <>
                   <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm shadow-lg flex-items-center justify-center hover:bg-white transition-all z-20 opacity-0 group-hover:opacity-100 flex items-center">
                     <ChevronLeft className="h-5 w-5 text-gray-700 ml-[0.35rem]" />
                   </button>
                   <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm shadow-lg flex-items-center justify-center hover:bg-white transition-all z-20 opacity-0 group-hover:opacity-100 flex items-center">
                     <ChevronRight className="h-5 w-5 text-gray-700 ml-1.5" />
                   </button>
                 </>
              )}

              {/* Dots */}
              {effectiveHeroSlides.length > 1 && (
                 <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                   {effectiveHeroSlides.map((_, i) => (
                     <button key={i} onClick={() => setCurrent(i)}
                       className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'w-7 bg-[#c2e55c] shadow-md' : 'bg-white/50 hover:bg-white/70'}`} />
                   ))}
                 </div>
              )}
            </div>
          </div>

          {/* Right Side Panels */}
          <div className="hidden lg:flex lg:col-span-2 flex-col gap-4">
             {/* Right 1 */}
             {right1Banner ? (
                <Link href={right1Banner.href || '#'} className="flex-1 relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-100">
                   {right1Banner.bg_gradient && right1Banner.bg_gradient.length > 0 && (
                      <Image src={right1Banner.bg_gradient} alt={right1Banner.title || 'Right Banner 1'} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                   )}
                   {right1Banner.title && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center p-3">
                         <h4 className="font-bold text-white text-sm">{right1Banner.title}</h4>
                      </div>
                   )}
                </Link>
             ) : (
                <div className="flex-1 rounded-2xl bg-gray-100" />
             )}
             
             {/* Right 2 */}
             {right2Banner ? (
                <Link href={right2Banner.href || '#'} className="flex-1 relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-100">
                   {right2Banner.bg_gradient && right2Banner.bg_gradient.length > 0 && (
                      <Image src={right2Banner.bg_gradient} alt={right2Banner.title || 'Right Banner 2'} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                   )}
                   {right2Banner.title && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center p-3">
                         <h4 className="font-bold text-white text-sm">{right2Banner.title}</h4>
                      </div>
                   )}
                </Link>
             ) : (
                <div className="flex-1 rounded-2xl bg-gray-100" />
             )}
          </div>
        </div>
      </div>
    </section>
  )
}

