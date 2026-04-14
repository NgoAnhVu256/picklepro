import Link from "next/link"
import { Target, CircleDashed, Briefcase, Wrench, Footprints, Shirt, Package } from "lucide-react"
import { supabaseAdmin } from '@picklepro/back-end'

const getIconForSlug = (slug: string) => {
  if (slug.includes('vot')) return Target;
  if (slug.includes('bong')) return CircleDashed;
  if (slug.includes('tui') || slug.includes('balo')) return Briefcase;
  if (slug.includes('giay')) return Footprints;
  if (slug.includes('ao') || slug.includes('quan')) return Shirt;
  if (slug.includes('phu-kien')) return Wrench;
  return Package;
}

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
    <section className="bg-white border-b border-border shadow-sm relative z-10">
      <div className="container mx-auto px-4 max-w-[1200px]">
        {/* SVG Gradient Definition */}
        <svg width="0" height="0" className="absolute w-0 h-0 pointer-events-none">
          <defs>
            <linearGradient id="lime-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" /> {/* Xanh Lime */}
              <stop offset="100%" stopColor="#3b82f6" /> {/* Xanh Blue */}
            </linearGradient>
          </defs>
        </svg>

        {/* Horizontal Scroll Area */}
        <div className="flex overflow-x-auto hide-scrollbar gap-8 py-6 items-center justify-start md:justify-center">
          {categories.map((category) => {
            const Icon = getIconForSlug(category.slug);
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group flex flex-col items-center gap-3 shrink-0"
              >
                {/* SVG Icon Area */}
                <div className="w-16 h-16 rounded-3xl bg-transparent flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
                  <Icon className="w-10 h-10 transition-transform group-hover:-translate-y-1" style={{ stroke: 'url(#lime-blue-grad)', strokeWidth: 1.5 }} />
                </div>
                {/* Text Label */}
                <span className="text-sm font-bold text-black text-center whitespace-nowrap group-hover:text-lime-dark transition-colors">
                  {category.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  )
}
