'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, Shield, RotateCcw, ChevronRight, ArrowLeft, Share2, Check } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'

interface ProductFull {
  id: string; name: string; slug: string; brand: string; price: number
  original_price: number | null
  description: string | null; tags: string[]; specs: Record<string, string> | null
  stock: number; is_featured: boolean; category_id: string
  categories: { name: string; slug: string } | null
  product_images?: { id: string; url: string; is_primary: boolean }[]
}

const productEmojis: Record<string, string> = {
  'vot-pickleball': '🏓', 'bong-pickleball': '⚾', 'tui-balo': '🎒',
  'phu-kien-grip': '🧤', 'giay-the-thao': '👟', 'quan-ao': '👕',
  'luoi-san': '🥅', 'combo-tiet-kiem': '🎁',
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const [product, setProduct] = useState<ProductFull | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [liked, setLiked] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const { addItem } = useCart()

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/products?slug=${slug}`)
        const data = await res.json()
        setProduct(data.product)
        setRelatedProducts(data.relatedProducts || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (slug) fetchProduct()
  }, [slug])

  // Dynamic title cho SEO
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | PicklePro`
    }
  }, [product])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square rounded-3xl bg-muted" />
            <div className="space-y-4">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-8 w-3/4 bg-muted rounded" />
              <div className="h-6 w-48 bg-muted rounded" />
              <div className="h-10 w-40 bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <span className="text-7xl block mb-4">😕</span>
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-muted-foreground mb-6">Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link href="/products">
            <Button className="rounded-full bg-lime hover:bg-lime-dark text-lime-dark hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại cửa hàng
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : null
  const emoji = product.categories ? productEmojis[product.categories.slug] || '🏓' : '🏓'
  const inStock = product.stock > 0

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      slug: product.slug,
    }, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  // JSON-LD Product Schema cho Google Rich Snippets
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: { '@type': 'Brand', name: product.brand },
    description: product.description || `${product.name} - Sản phẩm Pickleball chính hãng tại PicklePro`,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'VND',
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'PicklePro' },
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: `${typeof window !== 'undefined' ? window.location.origin : ''}/` },
      { '@type': 'ListItem', position: 2, name: 'Sản phẩm', item: `${typeof window !== 'undefined' ? window.location.origin : ''}/products` },
      { '@type': 'ListItem', position: 3, name: product.categories?.name || 'Danh mục', item: `${typeof window !== 'undefined' ? window.location.origin : ''}/products` },
      { '@type': 'ListItem', position: 4, name: product.name },
    ],
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-lime-dark transition-colors shrink-0">Trang chủ</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/products" className="hover:text-lime-dark transition-colors shrink-0">Sản phẩm</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          {product.categories && (
            <>
              <Link href={`/products?category=${product.categories.slug}`} className="hover:text-lime-dark transition-colors shrink-0">
                {product.categories.name}
              </Link>
              <ChevronRight className="h-3 w-3 shrink-0" />
            </>
          )}
          <span className="text-foreground font-medium truncate max-w-[150px] sm:max-w-[250px]">{product.name}</span>
        </nav>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">

          {/* Left — Image Gallery */}
          <div className="w-full">
            {/* Main Image */}
            <div className="w-full aspect-square rounded-2xl sm:rounded-3xl bg-gradient-to-br from-lime/5 via-lime-light/10 to-lime/10 border border-lime/20 flex items-center justify-center relative overflow-hidden group">
              {/* Badges */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-col gap-1.5 z-10">
                {product.is_featured && <Badge className="bg-lime text-lime-dark text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 border-none shadow-sm">⭐ Nổi bật</Badge>}
                {discount && <Badge className="bg-red-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 border-none shadow-sm">-{discount}%</Badge>}
              </div>

              {/* Share button */}
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-lime-dark transition-all shadow-md border border-border/50">
                  <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {/* Main Image Display */}
              {(() => {
                const images = product.product_images || []
                const primaryImg = images.find(i => i.is_primary) || images[0]
                return primaryImg?.url ? (
                  <img src={selectedImage || primaryImg.url} alt={product.name} className="w-full h-full object-contain p-4 sm:p-8 transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <>
                    <div className="absolute w-40 h-40 sm:w-64 sm:h-64 bg-lime/20 rounded-full blur-3xl" />
                    <span className="text-[80px] sm:text-[120px] lg:text-[160px] relative z-10 drop-shadow-xl">{emoji}</span>
                  </>
                )
              })()}
              
              {/* Pagination Dots */}
              <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2">
                {(product.product_images?.length || 1) > 1 && product.product_images?.map((img, idx) => (
                  <span 
                    key={idx}
                    className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                      (selectedImage || product.product_images?.find(i => i.is_primary)?.url || product.product_images?.[0]?.url) === img.url
                        ? 'w-5 sm:w-6 bg-lime-dark' : 'w-1.5 sm:w-2 bg-border hover:bg-lime/50'
                    }`}
                    onClick={() => setSelectedImage(img.url)}
                  ></span>
                ))}
              </div>
            </div>

            {/* Thumbnail Gallery — Horizontal scroll on all screens */}
            {product.product_images && product.product_images.length > 1 && (
              <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.product_images.map((img) => (
                  <button key={img.id} onClick={() => setSelectedImage(img.url)}
                    className={`shrink-0 w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all p-0.5 sm:p-1 bg-white ${
                      (selectedImage || product.product_images?.find(i => i.is_primary)?.url || product.product_images?.[0]?.url) === img.url 
                        ? 'border-lime-dark shadow-md ring-1 ring-lime-dark/50' : 'border-border hover:border-lime/50 opacity-70 hover:opacity-100'
                    }`}>
                    <img src={img.url} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — Info */}
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Name & Status */}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground leading-tight mb-2">{product.name}</h1>
              <div className="flex items-center gap-3 mb-3">
                <Badge className={`${inStock ? 'bg-lime text-lime-dark' : 'bg-red-100 text-red-500'} font-bold px-2.5 py-0.5 text-xs rounded-full border-0`}>
                  {inStock ? 'Còn hàng' : 'Hết hàng'}
                </Badge>
              </div>
              
              {/* Price */}
              <div className="flex items-end gap-2">
                {product.original_price && product.original_price > product.price && (
                  <span className="text-sm sm:text-base text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
                )}
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground">{formatPrice(product.price)}</span>
              </div>
            </div>

            {/* Description Snippet */}
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground leading-relaxed">
                {product.description?.substring(0, 150) || 'Dòng sản phẩm cao cấp với công nghệ tiên tiến nhất, mang đến trải nghiệm tuyệt vời cho mọi trận đấu.'}...
              </p>
              
              <ul className="space-y-1.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5 shrink-0">👉</span>
                  <span>Độ đàn hồi và trợ lực mạnh mẽ khi bóng tiếp xúc mặt vợt, tối đa hóa sức mạnh</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5 shrink-0">👉</span>
                  <span>Mặt nhám vật lý tự nhiên, tạo xoáy sâu và kiểm soát bóng tốt hơn</span>
                </li>
              </ul>
              
              <p className="text-sm font-semibold pt-1 text-foreground flex items-center gap-2">
                <span className="w-4 h-[2px] bg-foreground/40 inline-block"></span>
                Freeship đơn hàng trên 1 triệu
              </p>
            </div>

            {/* Variations */}
            <div className="space-y-4 pt-3 border-t border-border/50">
              {/* Brand */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground opacity-80">Thương hiệu:</label>
                <div>
                  <span className="inline-block px-4 py-1.5 border-2 border-lime/30 text-lime-dark text-sm font-bold uppercase tracking-widest rounded-lg bg-gradient-to-r from-lime/10 to-transparent shadow-sm">
                    {product.brand}
                  </span>
                </div>
              </div>

              {/* Category-specific attributes */}
              {(() => {
                const catSlug = product.categories?.slug || ''
                
                if (catSlug === 'vot-pickleball') {
                  const thicknessOptions = ['14mm', '16mm']
                  const specThickness = product.specs?.['Độ dày'] || product.specs?.['Thickness'] || null
                  return (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground opacity-80">Độ dày mặt vợt:</label>
                      <div className="flex items-center gap-2">
                        {thicknessOptions.map((t) => {
                          const isMatch = specThickness ? specThickness.includes(t.replace('mm','')) : t === '16mm'
                          return (
                            <span key={t} className={`px-4 py-2 rounded-lg border-2 text-sm font-bold cursor-default transition-all ${isMatch ? 'border-lime-dark bg-lime/10 text-lime-dark shadow-sm' : 'border-border text-muted-foreground bg-muted/30'}`}>
                              {t}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )
                }
                
                if (catSlug === 'quan-ao') {
                  const sizes = ['S', 'M', 'L', 'XL', 'XXL']
                  const fallbackColors = ['#FDE047', '#93C5FD', '#F472B6', '#D6D3D1', '#15803D', '#EF4444', '#A855F7']
                  const images = product.product_images || []
                  return (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground opacity-80">Size:</label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {sizes.map((s) => (
                            <span key={s} className="px-3 py-1.5 rounded-lg border-2 border-border text-sm font-bold cursor-default text-foreground hover:border-lime/50 transition-all bg-white">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-foreground opacity-80">Màu sắc:</label>
                        <div className="flex items-center gap-2">
                          {images.length === 0 ? (
                            <span className="text-xs text-muted-foreground">Mặc định</span>
                          ) : (
                            images.map((img, idx) => {
                              const colorHex = (img as any).color_code || fallbackColors[idx % fallbackColors.length]
                              const colorName = (img as any).color_name || `Màu ${idx + 1}`
                              const isSelected = selectedImage === img.url || (!selectedImage && idx === 0)
                              return (
                                <button key={img.id} onClick={() => setSelectedImage(img.url)}
                                  className={`w-9 h-9 rounded-lg border-2 transition-all shadow-sm ${isSelected ? 'border-lime-dark scale-110' : 'border-border hover:border-lime/50'} p-0.5 relative group/btn`}
                                  title={colorName}>
                                  <div className="w-full h-full rounded-md flex items-center justify-center" style={{ backgroundColor: colorHex }}>
                                    {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                                  </div>
                                </button>
                              )
                            })
                          )}
                        </div>
                      </div>
                    </>
                  )
                }
                
                return null
              })()}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-3 border-t border-border/50">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground opacity-80">Số lượng:</label>
                <div className="flex items-center w-max rounded-lg border border-border bg-white shadow-sm overflow-hidden">
                  <button className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={!inStock}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 h-10 flex items-center justify-center font-bold text-sm border-x border-border/50 bg-gray-50/50">{quantity}</span>
                  <button className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={!inStock}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full">
                <button 
                  className="flex-1 h-12 rounded-xl text-base font-bold transition-all active:scale-95 shadow-lg shadow-lime/30 bg-gradient-to-r from-lime-dark to-lime hover:opacity-90 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none" 
                  disabled={!inStock} 
                  onClick={() => { handleAddToCart(); window.location.href = '/checkout'; }}
                >
                  Mua ngay
                </button>

                <button 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border-2 active:scale-95 shadow-sm ${addedToCart ? 'bg-lime text-lime-dark border-lime' : 'bg-white border-border hover:border-lime-dark text-foreground'}`}
                  disabled={!inStock} 
                  onClick={handleAddToCart}
                  title="Thêm vào giỏ hàng"
                >
                  {addedToCart ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
                </button>

                <button 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all border-2 active:scale-95 shadow-sm bg-white ${liked ? 'border-red-500 text-red-500 bg-red-50/50' : 'border-border hover:border-red-400 text-foreground'}`}
                  disabled={!inStock} 
                  onClick={() => setLiked(!liked)}
                  title="Yêu thích"
                >
                  <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Danh mục:</span>
                <Link href={`/products?category=${product.categories?.slug || ''}`} className="text-lime-dark font-bold hover:underline transition-all">
                  {product.categories?.name || 'Vợt Pickleball'}
                </Link>
              </div>
            </div>

            {/* Tabs: Mô tả & Thông số */}
            <div className="mt-4">
              <Tabs defaultValue="specs">
                <TabsList className="rounded-lg bg-muted p-1 inline-flex w-full">
                  <TabsTrigger value="specs" className="rounded-md flex-1 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm text-xs sm:text-sm font-medium">Thông số kỹ thuật</TabsTrigger>
                  <TabsTrigger value="description" className="rounded-md flex-1 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm text-xs sm:text-sm font-medium">Mô tả chi tiết</TabsTrigger>
                </TabsList>

                <TabsContent value="specs" className="mt-4">
                  {product.specs ? (
                    <div className="rounded-xl border border-border overflow-hidden bg-white">
                      {Object.entries(product.specs).map(([key, value], i) => (
                        <div key={key} className={`flex ${i % 2 === 0 ? 'bg-muted/30' : 'bg-transparent'}`}>
                          <span className="w-[35%] sm:w-[40%] px-3 sm:px-5 py-3 text-xs sm:text-sm font-medium text-muted-foreground border-r border-border">{key}</span>
                          <span className="flex-1 px-3 sm:px-5 py-3 text-xs sm:text-sm font-medium text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center border rounded-xl border-dashed">
                      <p className="text-muted-foreground text-sm">Chưa có thông số kỹ thuật.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="description" className="mt-4">
                  <div className="p-4 sm:p-6 rounded-xl bg-white border border-border shadow-sm">
                    <div className="text-foreground leading-relaxed text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: product.description || 'Chưa có mô tả cho sản phẩm này.' }} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 lg:mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground">Sản phẩm liên quan</h2>
              <Link href="/products" className="text-sm font-medium text-lime-dark hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {relatedProducts.map((p: any) => (
                <Link href={`/products/${p.slug}`} key={p.id} className="group block rounded-2xl bg-gradient-to-br from-lime/5 to-lime-light/10 border border-lime/20 p-3 sm:p-4 hover:border-lime/50 transition-all">
                  <div className="aspect-square rounded-xl bg-white/50 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <span className="text-4xl sm:text-6xl">{emoji}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs font-medium text-lime-dark uppercase">{p.brand}</p>
                  <h3 className="font-bold text-xs sm:text-sm text-foreground line-clamp-2 mb-1">{p.name}</h3>
                  <p className="font-bold text-sm text-lime-dark">{formatPrice(p.price)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  )
}
