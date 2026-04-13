import Link from "next/link"
import Image from "next/image"
import { supabaseAdmin } from '@picklepro/back-end'

const categoryStyles = [
  {
    name: "Vợt Pickleball",
    slug: "vot-pickleball",
    image: "/categories/vot-pickleball.png",
    gradient: "from-[#c9deff] to-[#e7ff96]",
    border: "border-white/50",
    labelColor: "text-black",
  },
  {
    name: "Bóng Pickleball",
    slug: "bong-pickleball",
    image: "/categories/bong-pickleball.png",
    gradient: "from-[#c9deff] to-[#e7ff96]",
    border: "border-white/50",
    labelColor: "text-black",
  },
  {
    name: "Túi & Balo",
    slug: "tui-balo",
    image: "/categories/tui-balo.png",
    gradient: "from-[#c9deff] to-[#e7ff96]",
    border: "border-white/50",
    labelColor: "text-black",
  },
  {
    name: "Phụ kiện",
    slug: "phu-kien-grip",
    image: "/categories/phu-kien.png",
    gradient: "from-[#c9deff] to-[#e7ff96]",
    border: "border-white/50",
    labelColor: "text-black",
  },
  {
    name: "Giày thể thao",
    slug: "giay-the-thao",
    image: "/categories/giay-the-thao.png",
    gradient: "from-[#c9deff] to-[#e7ff96]",
    border: "border-white/50",
    labelColor: "text-black",
  },
  {
    name: "Quần áo",
    slug: "quan-ao",
    image: "/categories/quan-ao.png",
    gradient: "from-[#c9deff] to-[#e7ff96]",
    border: "border-white/50",
    labelColor: "text-black",
  },
]

export async function Categories() {
  const { data: categoriesData } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })

  const categories = categoriesData ?? []

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="py-10 sm:py-14">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
          {categories.map((category, idx) => {
            const style = categoryStyles[idx % categoryStyles.length]
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className={`group flex flex-col items-center rounded-lg border ${style.border} bg-gradient-to-br ${style.gradient} overflow-hidden hover:shadow-xl hover:shadow-lime/15 transition-all duration-300 hover:-translate-y-1.5`}
              >
              {/* Image area */}
              <div className="relative w-full aspect-square overflow-hidden bg-white/50">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <Image
                    src={style.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 33vw, 16vw"
                  />
                )}
                {/* Subtle gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
              </div>

              {/* Label */}
              <div className="w-full px-2 py-2.5 sm:py-3 text-center">
                <span className={`text-[11px] sm:text-sm font-bold ${style.labelColor} leading-tight block truncate`}>
                  {category.name}
                </span>
              </div>
            </Link>
          )})}
        </div>
      </div>
    </section>
  )
}
