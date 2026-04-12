"use client"

import Link from "next/link"
import Image from "next/image"

const categories = [
  {
    name: "Vợt Pickleball",
    slug: "vot-pickleball",
    image: "/categories/vot-pickleball.png",
    gradient: "from-lime/30 to-lime-light/50",
    border: "border-lime/20",
    labelColor: "text-lime-dark",
  },
  {
    name: "Bóng Pickleball",
    slug: "bong-pickleball",
    image: "/categories/bong-pickleball.png",
    gradient: "from-yellow-100 to-orange-100",
    border: "border-yellow-200",
    labelColor: "text-orange-700",
  },
  {
    name: "Túi & Balo",
    slug: "tui-balo",
    image: "/categories/tui-balo.png",
    gradient: "from-blue-100 to-cyan-100",
    border: "border-blue-200",
    labelColor: "text-blue-700",
  },
  {
    name: "Phụ kiện",
    slug: "phu-kien-grip",
    image: "/categories/phu-kien.png",
    gradient: "from-purple-100 to-pink-100",
    border: "border-purple-200",
    labelColor: "text-purple-700",
  },
  {
    name: "Giày thể thao",
    slug: "giay-the-thao",
    image: "/categories/giay-the-thao.png",
    gradient: "from-red-100 to-orange-100",
    border: "border-red-200",
    labelColor: "text-red-700",
  },
  {
    name: "Quần áo",
    slug: "quan-ao",
    image: "/categories/quan-ao.png",
    gradient: "from-green-100 to-teal-100",
    border: "border-green-200",
    labelColor: "text-green-700",
  },
]

export function Categories() {
  return (
    <section className="py-10 sm:py-14 bg-background">
      <div className="container mx-auto px-4">
        {/* Section title */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Danh mục <span className="text-lime-dark">sản phẩm</span>
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">Chọn danh mục bạn quan tâm</p>
          </div>
          <Link href="/products" className="text-lime-dark text-sm font-medium hover:underline whitespace-nowrap">
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/products?category=${category.slug}`}
              className={`group flex flex-col items-center rounded-2xl sm:rounded-3xl border ${category.border} bg-gradient-to-br ${category.gradient} overflow-hidden hover:shadow-xl hover:shadow-lime/15 transition-all duration-300 hover:-translate-y-1.5`}
            >
              {/* Image area */}
              <div className="relative w-full aspect-square overflow-hidden">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 16vw"
                />
                {/* Subtle gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Label */}
              <div className="w-full px-2 py-2.5 sm:py-3 text-center">
                <span className={`text-[11px] sm:text-sm font-bold ${category.labelColor} leading-tight block`}>
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
