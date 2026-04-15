"use client"

import Link from "next/link"
import Image from "next/image"
import { useCallback, useState } from "react"
import { useAdminRealtime } from "@/hooks/use-admin-realtime"

interface Category {
  id: string
  slug: string
  name: string
  image_url: string | null
}

interface CategoriesProps {
  initialCategories?: Category[]
}

export function Categories({ initialCategories = [] }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)

  const reloadCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data.categories ?? [])
    } catch {
      // Ignore transient fetch errors.
    }
  }, [])

  useAdminRealtime({
    scopes: ['categories'],
    onChange: () => reloadCategories(),
  })

  if (categories.length === 0) {
    return null
  }

  // Fallback images based on slug
  const getFallbackImg = (slug: string) => {
    if (slug.includes('vot')) return "/categories/vot-pickleball.png";
    if (slug.includes('bong')) return "/categories/bong-pickleball.png";
    if (slug.includes('balo') || slug.includes('tui')) return "/categories/tui-balo.png";
    if (slug.includes('giay')) return "/categories/giay-the-thao.png";
    if (slug.includes('quan') || slug.includes('ao')) return "/categories/quan-ao.png";
    return "/categories/phu-kien.png";
  }

  return (
    <section className="bg-white border-b border-border shadow-sm relative z-10 pt-4 pb-0">
      <div className="container mx-auto px-4 max-w-[1200px]">
        {/* Horizontal Scroll Area */}
        <div className="flex overflow-x-auto hide-scrollbar gap-6 md:gap-8 py-4 items-start justify-start md:justify-center">
          {categories.map((category: Category) => {
            const imgSrc = category.image_url || getFallbackImg(category.slug)
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group flex flex-col items-center gap-2 max-w-[80px] shrink-0"
              >
                {/* App Icon Area */}
                <div className="w-[70px] h-[70px] md:w-[80px] md:h-[80px] rounded-[1.25rem] bg-white border border-gray-100 shadow-sm flex items-center justify-center transform group-hover:scale-105 transition-all duration-300 overflow-hidden relative">
                   <Image
                     src={imgSrc}
                     alt={category.name}
                     fill
                     className="object-cover"
                     sizes="80px"
                   />
                </div>
                {/* Text Label */}
                <span className="text-[12px] md:text-sm font-semibold text-black text-center leading-tight">
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
