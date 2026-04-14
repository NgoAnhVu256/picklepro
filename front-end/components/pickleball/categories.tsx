import Link from "next/link"
import Image from "next/image"
import { supabaseAdmin } from '@picklepro/back-end'

const categoryStyles = [
  { image: "/categories/vot-pickleball.png", gradient: "from-[#ff9a9e] to-[#fecfef]" },
  { image: "/categories/bong-pickleball.png", gradient: "from-[#a18cd1] to-[#fbc2eb]" },
  { image: "/categories/tui-balo.png", gradient: "from-[#84fab0] to-[#8fd3f4]" },
  { image: "/categories/phu-kien.png", gradient: "from-[#ffecd2] to-[#fcb69f]" },
  { image: "/categories/giay-the-thao.png", gradient: "from-[#cfd9df] to-[#e2ebf0]" },
  { image: "/categories/quan-ao.png", gradient: "from-[#f6d365] to-[#fda085]" },
]

export async function Categories() {
  const { data: categoriesData } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false })

  const categories = categoriesData ?? []

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="container mx-auto px-4">
        {/* Section title */}
        <div className="flex flex-col items-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-black text-center">
            Danh mục sản phẩm
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2 text-center">Chọn danh mục bạn quan tâm</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {categories.map((category, idx) => {
            const style = categoryStyles[idx % categoryStyles.length]
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group flex flex-col items-center max-w-[100px] sm:max-w-[120px]"
              >
                {/* Square Icon Area */}
                <div className={`w-20 h-20 sm:w-[90px] sm:h-[90px] rounded-[1.5rem] flex items-center justify-center bg-gradient-to-br ${style.gradient} shadow-sm group-hover:shadow-md transition-shadow mb-3 p-4`}>
                   {category.image_url ? (
                      <img src={category.image_url} alt={category.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                   ) : (
                      <Image src={style.image} alt={category.name} width={60} height={60} className="object-contain group-hover:scale-110 transition-transform duration-300" />
                   )}
                </div>

                {/* Text Label */}
                <span className="text-sm font-semibold text-black text-center leading-tight line-clamp-2">
                  {category.name}
                </span>
              </Link>
          )})}
        </div>
      </div>
    </section>
  )
}
