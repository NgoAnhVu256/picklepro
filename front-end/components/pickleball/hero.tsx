"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronLeft, ChevronRight, Star, Shield, Zap } from "lucide-react"
import Link from "next/link"

const slides = [
  {
    id: 1,
    badge: "🔥 Hot Deal",
    title: "Professional",
    titleHighlight: "Pickleball Gear",
    description: "Khám phá bộ sưu tập vợt & phụ kiện Pickleball cao cấp từ các thương hiệu hàng đầu thế giới.",
    buttonText: "Khám phá ngay",
    buttonGradient: "linear-gradient(135deg, #5054FE, #9B56FF)",
    bgGradient: "from-purple-100/40 via-blue-100/20 to-pink-100/30",
    href: "/products",
  },
  {
    id: 2,
    badge: "⭐ Best Seller",
    title: "JOOLA Ben Johns",
    titleHighlight: "Hyperion CAS",
    description: "Vợt #1 thế giới — Sử dụng bởi tay vợt số 1 Ben Johns. Carbon fiber, spin tối đa.",
    buttonText: "Xem ngay",
    buttonGradient: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
    bgGradient: "from-orange-100/40 via-red-100/20 to-yellow-100/30",
    href: "/products?brand=JOOLA",
  },
  {
    id: 3,
    badge: "🎁 Flash Sale",
    title: "Giảm đến 50%",
    titleHighlight: "Combo Tiết Kiệm",
    description: "Mua vợt + túi + grip — tiết kiệm ngay 50%. Số lượng có hạn, nhanh tay lên!",
    buttonText: "Mua combo",
    buttonGradient: "linear-gradient(135deg, #11998E, #38EF7D)",
    bgGradient: "from-green-100/40 via-teal-100/20 to-lime-100/30",
    href: "/products",
  },
  {
    id: 4,
    badge: "🏆 Member VIP",
    title: "Đăng ký thành viên",
    titleHighlight: "Ưu đãi độc quyền",
    description: "Giảm thêm 10% mọi đơn hàng, tích điểm đổi quà, giao hàng miễn phí.",
    buttonText: "Đăng ký ngay",
    buttonGradient: "linear-gradient(135deg, #667EEA, #764BA2)",
    bgGradient: "from-violet-100/40 via-purple-100/20 to-pink-100/30",
    href: "/auth/register",
  },
]

export function Hero() {
  const [current, setCurrent] = useState(0)

  // Auto slide every 5s
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length)
  const next = () => setCurrent((c) => (c + 1) % slides.length)

  const slide = slides[current]

  return (
    <section className="relative overflow-hidden py-6 md:py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch" style={{ minHeight: '360px' }}>
          {/* Left Side Panel */}
          <Link href="/products" className="hidden lg:block lg:col-span-2">
            <div className="relative h-full rounded-2xl overflow-hidden group cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #FFECD2, #FCB69F)' }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <span className="text-5xl mb-3">🏓</span>
                <h3 className="text-base font-bold text-gray-800 mb-1">PicklePro Shop</h3>
                <p className="text-xs text-gray-600 mb-3">Vợt & phụ kiện cao cấp</p>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}>
                  Xem chi tiết
                </span>
              </div>
            </div>
          </Link>

          {/* Center Banner Slider */}
          <div className="lg:col-span-8 relative">
            <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${slide.bgGradient} transition-all duration-500`}
              style={{ minHeight: '360px' }}>
              {/* Background decorations */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-10 left-10 w-48 h-48 bg-white/40 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-64 h-64 bg-white/30 rounded-full blur-3xl" />
              </div>

              <div className="relative z-10 flex flex-col justify-center h-full p-8 md:p-12">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 w-fit mb-4">
                  <span className="text-sm font-semibold text-gray-800">{slide.badge}</span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-3">
                  <span className="text-foreground">{slide.title}</span>
                  <br />
                  <span className="bg-clip-text text-transparent" style={{ backgroundImage: slide.buttonGradient }}>
                    {slide.titleHighlight}
                  </span>
                </h1>

                <p className="text-base text-muted-foreground max-w-lg mb-6">{slide.description}</p>

                {/* Button */}
                <div>
                  <Link href={slide.href}>
                    <Button size="lg" className="text-white font-bold rounded-lg px-8 py-5 text-base shadow-xl transition-all hover:scale-105"
                      style={{ background: slide.buttonGradient }}>
                      {slide.buttonText} <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center gap-5 pt-5">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Shield className="h-4 w-4 text-lime-dark" /> Bảo hành 12 tháng
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Star className="h-4 w-4 text-lime-dark fill-lime" /> 4.9/5 từ 2000+ đánh giá
                  </span>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all z-20">
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-all z-20">
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'w-7 bg-white shadow-md' : 'bg-white/50 hover:bg-white/70'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Side Panels */}
          <div className="hidden lg:flex lg:col-span-2 flex-col gap-4">
            <Link href="/auth/login" className="flex-1 relative group cursor-pointer">
              <div className="h-full rounded-2xl overflow-hidden p-5 flex flex-col justify-center items-center text-center"
                style={{ background: 'linear-gradient(135deg, #A18CD1, #FBC2EB)' }}>
                <span className="text-4xl mb-2">🏆</span>
                <h4 className="font-bold text-white text-sm mb-0.5">Member VIP</h4>
                <p className="text-white/80 text-xs">Ưu đãi độc quyền</p>
              </div>
            </Link>
            <Link href="/products" className="flex-1 relative group cursor-pointer">
              <div className="h-full rounded-2xl overflow-hidden p-5 flex flex-col justify-center items-center text-center"
                style={{ background: 'linear-gradient(135deg, #FF9A9E, #FECFEF)' }}>
                <span className="text-4xl mb-2">🎁</span>
                <h4 className="font-bold text-white text-sm mb-0.5">Flash Sale</h4>
                <p className="text-white/80 text-xs">Giảm 50% hôm nay</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
