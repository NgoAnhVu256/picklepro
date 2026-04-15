'use client'

import { useState, useEffect, Suspense } from 'react'
import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ShoppingCart, Heart, Star, ArrowRight, Filter, X, Search, SlidersHorizontal, Grid3X3, LayoutList, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Product {
  id: string
  name: string
  slug: string
  brand: string
  price: number
  original_price: number | null
  is_featured: boolean
  description: string | null
  tags: string[]
  categories: { name: string; slug: string } | null
  product_images?: { id: string; url: string; is_primary: boolean }[]
}

interface ProductResponse {
  products: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const brandColors: Record<string, string> = {
  'JOOLA': 'from-lime/10 via-lime-light/20 to-lime/10',
  'Selkirk': 'from-purple-100/50 via-pink-100/50 to-purple-100/50',
  'Paddletek': 'from-orange-100/50 via-yellow-100/50 to-orange-100/50',
  'HEAD': 'from-blue-100/50 via-cyan-100/50 to-blue-100/50',
  'Franklin': 'from-red-100/50 via-orange-100/50 to-red-100/50',
  'Engage': 'from-lime-light/30 via-lime/20 to-lime-light/30',
  'CRBN': 'from-gray-100/50 via-slate-100/50 to-gray-100/50',
  'Diadem': 'from-indigo-100/50 via-blue-100/50 to-indigo-100/50',
  'Onix': 'from-yellow-100/50 via-amber-100/50 to-yellow-100/50',
  'K-Swiss': 'from-teal-100/50 via-cyan-100/50 to-teal-100/50',
  'PicklePro': 'from-lime/20 via-lime-light/30 to-lime/20',
}

const productEmojis: Record<string, string> = {
  'vot-pickleball': '🏓',
  'bong-pickleball': '⚾',
  'tui-balo': '🎒',
  'phu-kien-grip': '🧤',
  'giay-the-thao': '👟',
  'quan-ao': '👕',
  'luoi-san': '🥅',
  'combo-tiet-kiem': '🎁',
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams?.get('category') || ''

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 })
  const [showFilters, setShowFilters] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState(categoryFromUrl)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [priceRange, setPriceRange] = useState([0, 10000000])
  const [currentPage, setCurrentPage] = useState(1)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (brand) params.set('brand', brand)
      if (category) params.set('category', category)
      params.set('sortBy', sortBy)
      params.set('sortOrder', sortOrder)
      params.set('page', currentPage.toString())
      params.set('limit', '12')
      if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString())
      if (priceRange[1] < 10000000) params.set('maxPrice', priceRange[1].toString())

      const res = await fetch(`/api/products?${params.toString()}`)
      const data: ProductResponse = await res.json()
      setProducts(data.products)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Lỗi tải sản phẩm:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCategory(categoryFromUrl)
  }, [categoryFromUrl])

  useEffect(() => {
    fetchProducts()
  }, [currentPage, sortBy, sortOrder, brand, category])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProducts()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f8fafc] to-[#f1f5f9]">
      <Header />

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-lime/20 via-lime-light/10 to-background py-10 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 right-20 w-64 h-64 bg-lime/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-48 h-48 bg-lime/20 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 relative">
          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
            Sản Phẩm <span className="bg-gradient-to-r from-lime-dark to-lime bg-clip-text text-transparent">Pickleball</span>
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Khám phá bộ sưu tập vợt, phụ kiện và trang phục Pickleball từ các thương hiệu hàng đầu thế giới
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-full border-lime/30 focus:border-lime"
              />
            </div>
            <Button type="submit" className="rounded-full bg-lime-dark hover:bg-lime-dark/80 text-white">
              Tìm
            </Button>
          </form>

          <div className="flex gap-2 items-center flex-wrap">
            {/* Sort */}
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(v) => {
              const [sb, so] = v.split('-')
              setSortBy(sb)
              setSortOrder(so)
              setCurrentPage(1)
            }}>
              <SelectTrigger className="w-[140px] sm:w-[180px] rounded-full border-lime/30 text-xs sm:text-sm">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Mới nhất</SelectItem>
                <SelectItem value="price-asc">Giá tăng dần</SelectItem>
                <SelectItem value="price-desc">Giá giảm dần</SelectItem>
                <SelectItem value="rating-desc">Đánh giá cao</SelectItem>
                <SelectItem value="name-asc">Tên A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Brand Filter */}
            <Select value={brand} onValueChange={(v) => { setBrand(v === 'all' ? '' : v); setCurrentPage(1) }}>
              <SelectTrigger className="w-[120px] sm:w-[150px] rounded-full border-lime/30 text-xs sm:text-sm">
                <SelectValue placeholder="Thương hiệu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="JOOLA">JOOLA</SelectItem>
                <SelectItem value="Selkirk">Selkirk</SelectItem>
                <SelectItem value="HEAD">HEAD</SelectItem>
                <SelectItem value="Franklin">Franklin</SelectItem>
                <SelectItem value="Paddletek">Paddletek</SelectItem>
                <SelectItem value="Engage">Engage</SelectItem>
                <SelectItem value="CRBN">CRBN</SelectItem>
              </SelectContent>
            </Select>

            {/* Result Count */}
            <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
              {pagination.total} SP
            </span>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 p-3 sm:p-5 animate-pulse">
                <div className="aspect-square rounded-xl sm:rounded-2xl bg-muted mb-3 sm:mb-4" />
                <div className="h-3 sm:h-4 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 sm:h-5 bg-muted rounded w-2/3 mb-3" />
                <div className="h-3 sm:h-4 bg-muted rounded w-1/4 mb-4" />
                <div className="h-8 sm:h-10 bg-muted rounded-xl" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-xl font-bold text-foreground mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-muted-foreground mb-4">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <Button variant="outline" className="rounded-full border-lime/50" onClick={() => { setSearch(''); setBrand(''); setCurrentPage(1); fetchProducts() }}>
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => {
              const gradient = brandColors[product.brand] || 'from-gray-100/50 via-white to-gray-100/50'
              const emoji = product.categories ? productEmojis[product.categories.slug] || '🏓' : '🏓'
              const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : null

              return (
                <Link href={`/products/${product.slug}`} key={product.id} className="group relative block">
                  {/* Glow */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-lime via-lime-dark to-lime rounded-3xl opacity-0 group-hover:opacity-60 blur-lg transition-all duration-500 group-hover:duration-200" />

                  <div className={`relative bg-gradient-to-br ${gradient} backdrop-blur-sm border border-lime/20 rounded-2xl sm:rounded-3xl p-3 sm:p-5 transition-all duration-300 group-hover:border-lime/50 h-full flex flex-col`}>
                    {/* Badges */}
                    <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex gap-1 sm:gap-2 z-10">
                      {product.is_featured && (
                        <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-lime text-lime-dark">⭐ Nổi bật</span>
                      )}
                      {discount && (
                        <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-red-500 text-white">-{discount}%</span>
                      )}
                    </div>

                    {/* Wishlist */}
                    <button className="absolute top-2 right-2 sm:top-4 sm:right-4 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-white transition-all shadow-sm z-10"
                      onClick={(e) => e.preventDefault()}>
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>

                    {/* Image */}
                    <div className="aspect-square rounded-xl sm:rounded-2xl bg-white/50 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                      {(() => {
                        const primaryImg = product.product_images?.find(i => i.is_primary) || product.product_images?.[0]
                        return primaryImg?.url ? (
                          <img src={primaryImg.url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <span className="text-5xl sm:text-7xl">{emoji}</span>
                        )
                      })()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col gap-1">
                      <p className="text-[10px] sm:text-xs font-medium text-lime-dark uppercase tracking-wider">{product.brand}</p>
                      <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-2 leading-snug">{product.name}</h3>

                      <div className="flex items-center gap-1 sm:gap-2 mt-1">
                        <span className="text-[10px] sm:text-xs inline-flex px-1.5 py-0.5 rounded bg-lime/10 text-lime-dark font-medium">{product.brand}</span>
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2 mt-auto pt-1 sm:pt-2">
                        <span className="text-sm sm:text-lg font-bold text-lime-dark">{formatPrice(product.price)}</span>
                        {product.original_price && (
                          <span className="text-[10px] sm:text-xs text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
                        )}
                      </div>

                      {product.categories && (
                        <span className="text-xs text-muted-foreground bg-white/60 rounded-full px-2.5 py-0.5 self-start mt-1">
                          {product.categories.name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-lime/30"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: pagination.totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                size="icon"
                className={`rounded-full ${currentPage === i + 1 ? 'bg-lime text-lime-dark hover:bg-lime-dark hover:text-white' : 'border-lime/30'}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-lime/30"
              disabled={currentPage === pagination.totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-lime/30 border-t-lime-dark rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải sản phẩm...</p>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  )
}
