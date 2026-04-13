"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Zap, Shield } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-lime-light/30 to-background py-12 md:py-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-lime/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-lime/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime/20 border border-lime/30">
              <Zap className="h-4 w-4 text-lime-dark" />
              <span className="text-sm font-medium text-lime-dark">Mùa hè 2026 - Giảm đến 50%</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-balance">
              <span className="text-foreground">Professional</span>
              <br />
              <span className="bg-gradient-to-r from-lime-dark via-lime to-lime-dark bg-clip-text text-transparent">
                Pickleball Gear
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg text-pretty">
              Khám phá bộ sưu tập vợt & phụ kiện Pickleball cao cấp từ các thương hiệu hàng đầu thế giới. 
              Nâng tầm trải nghiệm chơi của bạn!
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/products">
                <Button 
                  size="lg" 
                  className="text-white font-bold rounded-full px-8 py-6 text-lg shadow-xl shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-purple-500/50"
                  style={{ background: 'linear-gradient(135deg, #5054FE, #9B56FF)' }}
                >
                  Khám phá ngay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/products">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-[#5054FE]/30 text-[#5054FE] hover:bg-[#5054FE]/10 font-semibold rounded-full px-8 py-6 text-lg"
                >
                  Xem khuyến mãi
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-lime-dark" />
                <span className="text-sm text-muted-foreground">Bảo hành 12 tháng</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-lime-dark fill-lime" />
                <span className="text-sm text-muted-foreground">4.9/5 từ 2000+ đánh giá</span>
              </div>
            </div>
          </div>

          {/* Right Content - Promotional Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Main Promo Card */}
            <Link href="/products" className="col-span-2 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-lime via-lime-dark to-lime rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative bg-gradient-to-br from-lime/90 to-lime-dark rounded-3xl p-6 md:p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium text-white mb-4">
                    Hot Deal
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Vợt & Phụ kiện
                  </h3>
                  <p className="text-white/80 mb-4">Combo tiết kiệm lên đến 40%</p>
                  <span className="inline-flex items-center bg-white text-lime-dark font-semibold rounded-full px-4 py-2 text-sm">
                    Xem chi tiết →
                  </span>
                </div>
              </div>
            </Link>

            {/* Secondary Cards */}
            <Link href="/auth/login" className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
              <div className="relative bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-5 h-full">
                <span className="text-3xl mb-2 block">🏆</span>
                <h4 className="font-bold text-white mb-1">Member VIP</h4>
                <p className="text-white/80 text-sm">Ưu đãi độc quyền</p>
              </div>
            </Link>

            <Link href="/products" className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
              <div className="relative bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-5 h-full">
                <span className="text-3xl mb-2 block">🎁</span>
                <h4 className="font-bold text-white mb-1">Flash Sale</h4>
                <p className="text-white/80 text-sm">Giảm 50% hôm nay</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
