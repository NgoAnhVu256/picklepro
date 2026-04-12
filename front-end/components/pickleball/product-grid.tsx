"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Star, ArrowRight, Check, Loader2 } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"
import { useState, useEffect } from "react"

interface Product {
  id: string; name: string; slug: string; brand: string
  price: number; original_price: number | null; rating: number
  review_count: number; is_featured: boolean
  categories: { name: string; slug: string } | null
}

const brandColors: Record<string, string> = {
  'JOOLA': 'from-lime/10 via-lime-light/20 to-lime/10',
  'Selkirk': 'from-purple-100/50 via-pink-100/50 to-purple-100/50',
  'Paddletek': 'from-orange-100/50 via-yellow-100/50 to-orange-100/50',
  'HEAD': 'from-blue-100/50 via-cyan-100/50 to-blue-100/50',
  'Franklin': 'from-red-100/50 via-orange-100/50 to-red-100/50',
  'Engage': 'from-lime-light/30 via-lime/20 to-lime-light/30',
  'CRBN': 'from-gray-100/50 via-slate-100/50 to-gray-100/50',
}

const categoryEmojis: Record<string, string> = {
  'vot-pickleball': '🏓', 'bong-pickleball': '⚾', 'tui-balo': '🎒',
  'phu-kien-grip': '🧤', 'giay-the-thao': '👟', 'quan-ao': '👕',
  'luoi-san': '🥅', 'combo-tiet-kiem': '🎁',
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export function ProductGrid() {
  const { addItem } = useCart()
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products?isFeatured=true&limit=6&sortBy=rating&sortOrder=desc')
      .then(r => r.json())
      .then(data => {
        setProducts(data.products ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      slug: product.slug,
      quantity: 1,
    })
    setAddedIds(prev => new Set(prev).add(product.id))
    setTimeout(() => setAddedIds(prev => {
      const next = new Set(prev)
      next.delete(product.id)
      return next
    }), 2000)
  }

  const discount = (p: Product) =>
    p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : 0

  return (
    <section className="py-16 bg-gradient-to-b from-background to-lime-light/5">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Sản Phẩm <span className="text-lime-dark">Nổi Bật</span>
            </h2>
            <p className="text-muted-foreground">Được yêu thích nhất bởi cộng đồng Pickleball Việt Nam</p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="hidden md:flex rounded-full border-lime/30 hover:bg-lime/10 text-lime-dark font-medium">
              Xem tất cả <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl sm:rounded-3xl bg-muted/30 h-[260px] sm:h-[340px] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">Chưa có sản phẩm nổi bật</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {products.map((product) => {
              const catSlug = product.categories?.slug ?? ''
              const emoji = categoryEmojis[catSlug] ?? '🏓'
              const bg = brandColors[product.brand] ?? 'from-lime/10 via-lime-light/20 to-lime/10'
              const disc = discount(product)
              const isAdded = addedIds.has(product.id)

              return (
                <div key={product.id} className="group relative rounded-2xl sm:rounded-3xl overflow-hidden border border-lime/10 bg-white hover:shadow-xl hover:shadow-lime/15 transition-all duration-500 hover:-translate-y-1">
                  {/* Badge */}
                  {disc > 0 && (
                    <span className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-red-500 text-white">
                      -{disc}%
                    </span>
                  )}
                  {product.is_featured && disc === 0 && (
                    <span className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-lime text-lime-dark">
                      Best Seller
                    </span>
                  )}
                  <button className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors">
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                  </button>

                  {/* Image */}
                  <Link href={`/products/${product.slug}`}>
                    <div className={`relative h-32 sm:h-48 bg-gradient-to-br ${bg} flex items-center justify-center overflow-hidden`}>
                      <span className="text-5xl sm:text-7xl group-hover:scale-110 transition-transform duration-500">{emoji}</span>
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-3 sm:p-5">
                    <p className="text-[10px] sm:text-xs font-semibold text-lime-dark uppercase tracking-wider mb-0.5 sm:mb-1">{product.brand}</p>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-xs sm:text-base font-bold text-foreground line-clamp-2 min-h-[2rem] sm:min-h-[3rem] hover:text-lime-dark transition-colors">{product.name}</h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 ${i < Math.round(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">({product.review_count})</span>
                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between mt-2 sm:mt-4">
                      <div>
                        <span className="text-sm sm:text-xl font-bold text-lime-dark">{formatPrice(product.price)}</span>
                        {product.original_price && (
                          <span className="block text-[10px] sm:text-xs text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        className={`rounded-full transition-all ${
                          isAdded
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-lime hover:bg-lime-dark text-lime-dark hover:text-white'
                        }`}
                      >
                        {isAdded ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Mobile CTA */}
        <div className="md:hidden text-center mt-8">
          <Link href="/products">
            <Button className="rounded-full bg-lime hover:bg-lime-dark text-lime-dark hover:text-white font-bold px-8">
              Xem tất cả sản phẩm <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
