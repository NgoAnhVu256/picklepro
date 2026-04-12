"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const collections = [
  {
    id: 1, title: "Vợt Pro Series", subtitle: "Dành cho tay chơi chuyên nghiệp",
    description: "Sử dụng công nghệ tiên tiến nhất", icon: "🏆",
    gradient: "from-lime via-lime-dark to-lime", cta: "Khám phá", href: "/products"
  },
  {
    id: 2, title: "Beginner Kit", subtitle: "Combo cho người mới",
    description: "Tiết kiệm đến 40%", icon: "🎓",
    gradient: "from-blue-400 via-blue-500 to-blue-600", cta: "Xem combo", href: "/products"
  },
  {
    id: 3, title: "Phụ Kiện Cao Cấp", subtitle: "Grip, Túi, Bóng...",
    description: "Đa dạng lựa chọn", icon: "✨",
    gradient: "from-purple-400 via-purple-500 to-pink-500", cta: "Mua ngay", href: "/products"
  },
  {
    id: 4, title: "Flash Sale", subtitle: "Giảm đến 50%",
    description: "Chỉ trong hôm nay", icon: "⚡",
    gradient: "from-orange-400 via-red-500 to-pink-500", cta: "Săn deal", href: "/products"
  },
  {
    id: 5, title: "New Arrivals", subtitle: "Hàng mới về",
    description: "Cập nhật liên tục", icon: "🆕",
    gradient: "from-teal-400 via-cyan-500 to-blue-500", cta: "Xem thêm", href: "/products"
  },
]

const collectionImages = [
  "🏓", "🎾", "🥎", "⚾", "🎯", "🏸", "🎪", "🏅"
]

export function FeaturedCollections() {
  return (
    <section className="py-16 bg-gradient-to-b from-lime-light/10 to-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Bộ Sưu Tập <span className="text-lime-dark">Nổi Bật</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Các bộ sưu tập được tuyển chọn theo chủ đề có thể bạn đang quan tâm
          </p>
        </div>

        {/* Collection Cards */}
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-5 md:overflow-visible scrollbar-hide">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={collection.href}
              className="relative group flex-shrink-0 w-56 md:w-auto"
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} rounded-3xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-300`} />
              
              <div className={`relative h-full bg-gradient-to-br ${collection.gradient} rounded-3xl p-5 text-white overflow-hidden transition-transform duration-300 group-hover:scale-[1.02]`}>
                {/* Decorative Circle */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
                
                <div className="relative z-10 h-full flex flex-col">
                  <span className="text-4xl mb-3">{collection.icon}</span>
                  <h3 className="font-bold text-lg mb-1">{collection.title}</h3>
                  <p className="text-white/90 text-sm mb-1">{collection.subtitle}</p>
                  <p className="text-white/70 text-xs mb-4">{collection.description}</p>
                  <div className="mt-auto">
                    <span className="inline-flex items-center text-sm font-semibold group-hover:underline">
                      {collection.cta}
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Collection Grid Preview */}
        <div className="mt-12 bg-white/50 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-lime/20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Thương hiệu nổi tiếng</h3>
              <p className="text-sm text-muted-foreground">Vợt từ các thương hiệu hàng đầu thế giới</p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="border-lime/50 text-lime-dark hover:bg-lime/10 rounded-full self-start md:self-auto">
                Xem tất cả bộ sưu tập
              </Button>
            </Link>
          </div>
          
          {/* Brand Logos Grid */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {collectionImages.map((icon, index) => (
              <Link
                key={index}
                href="/products"
                className="aspect-square rounded-2xl bg-gradient-to-br from-lime-light/50 to-white border border-lime/10 flex items-center justify-center text-3xl hover:scale-105 hover:shadow-lg hover:shadow-lime/20 transition-all cursor-pointer"
              >
                {icon}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
