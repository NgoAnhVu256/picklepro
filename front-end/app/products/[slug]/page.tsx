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
    <div className="min-h-screen bg-background">
      <Header />
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-lime-dark transition-colors">Trang chủ</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="hover:text-lime-dark transition-colors">Sản phẩm</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {product.categories && (
            <>
              <Link href={`/products?category=${product.categories.slug}`} className="hover:text-lime-dark transition-colors">
                {product.categories.name}
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
            </>
          )}
          <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left — Image Gallery */}
          <div className="relative flex flex-col-reverse md:flex-row gap-4 h-max sticky top-24">
            {/* Thumbnail Gallery (Left on Desktop, Bottom on Mobile) */}
            {product.product_images && product.product_images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-auto scrollbar-hide md:w-20 lg:w-24 shrink-0 pb-2 md:pb-0">
                {product.product_images.map((img) => (
                  <button key={img.id} onClick={() => setSelectedImage(img.url)}
                    className={`shrink-0 w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden border-2 transition-all p-1 bg-white ${
                      (selectedImage || product.product_images?.find(i => i.is_primary)?.url || product.product_images?.[0]?.url) === img.url 
                        ? 'border-lime-dark shadow-md ring-1 ring-lime-dark/50' : 'border-border hover:border-lime/50 opacity-70 hover:opacity-100'
                    }`}>
                    <img src={img.url} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="flex-1 aspect-[4/5] sm:aspect-square rounded-3xl bg-gradient-to-br from-lime/5 via-lime-light/10 to-lime/10 border border-lime/20 flex flex-col items-center justify-center relative overflow-hidden group">
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                {product.is_featured && <Badge className="bg-lime text-lime-dark text-xs sm:text-sm font-bold px-3 py-1 border-none shadow-sm">⭐ Nổi bật</Badge>}
                {discount && <Badge className="bg-red-500 text-white text-xs sm:text-sm font-bold px-3 py-1 border-none shadow-sm">-{discount}%</Badge>}
              </div>

              {/* Actions (Share) */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-lime-dark hover:bg-white transition-all shadow-md border border-border/50">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {/* Main Image Display */}
              {(() => {
                const images = product.product_images || []
                const primaryImg = images.find(i => i.is_primary) || images[0]
                return primaryImg?.url ? (
                  <img src={selectedImage || primaryImg.url} alt={product.name} className="w-full h-full object-contain mix-blend-multiply p-8 transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <>
                    <div className="absolute w-64 h-64 bg-lime/20 rounded-full blur-3xl" />
                    <span className="text-[120px] sm:text-[160px] relative z-10 drop-shadow-xl">{emoji}</span>
                  </>
                )
              })()}
              
              {/* Pagination Dots Simulator for design */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {(product.product_images?.length || 1) > 1 && product.product_images?.map((img, idx) => (
                  <span 
                    key={idx}
                    className={`h-2 rounded-full transition-all ${
                      (selectedImage || product.product_images?.find(i => i.is_primary)?.url || product.product_images?.[0]?.url) === img.url
                        ? 'w-6 bg-lime-dark' : 'w-2 bg-border hover:bg-lime/50 cursor-pointer'
                    }`}
                    onClick={() => setSelectedImage(img.url)}
                  ></span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Info */}
          <div className="flex flex-col gap-6">
            {/* Header: Name & Status */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">{product.name}</h1>
              </div>
              <Badge className={`${inStock ? 'bg-lime text-lime-dark' : 'bg-red-100 text-red-500'} font-bold px-3 py-1 mb-4 rounded-full border-0`}>
                {inStock ? 'Còn hàng' : 'Hết hàng'}
              </Badge>
              
              {/* Price */}
              <div className="flex items-end gap-3 rounded-2xl">
                {product.original_price && product.original_price > product.price && (
                  <span className="text-lg text-muted-foreground line-through decoration-muted-foreground/50">{formatPrice(product.original_price)}</span>
                )}
                <span className="text-3xl font-extrabold text-foreground">{formatPrice(product.price)}</span>
              </div>
            </div>

            {/* Description & Features Snippet */}
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {product.description?.substring(0, 150) || 'Dòng sản phẩm cao cấp với công nghệ tiên tiến nhất, mang đến trải nghiệm tuyệt vời cho mọi trận đấu.'}...
              </p>
              
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">👉</span>
                  <span>Độ đàn hồi và trợ lực mạnh mẽ khi bóng tiếp xúc mặt vợt, tối đa hóa sức mạnh</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">👉</span>
                  <span>Mặt nhám vật lý tự nhiên, tạo xoáy sâu và kiểm soát bóng tốt hơn</span>
                </li>
              </ul>
              
              <p className="text-sm font-semibold pt-2 text-foreground flex items-center gap-2">
                <span className="w-4 h-[2px] bg-foreground/40 inline-block"></span>
                Freeship đơn hàng trên 1 triệu
              </p>
            </div>

            {/* Variations */}
            <div className="space-y-6 pt-4 border-t border-border/50">
              {/* Brand */}
              <div className="space-y-2">
                <label className="text-base font-medium text-foreground opacity-80">Thương hiệu:</label>
                <div className="flex items-center">
                  <span className="px-5 py-2 border-2 border-lime/30 text-lime-dark text-lg font-bold uppercase tracking-widest rounded-xl bg-gradient-to-r from-lime/10 to-transparent shadow-sm">
                    {product.brand}
                  </span>
                </div>
              </div>

              {/* Category-specific attributes */}
              {(() => {
                const catSlug = product.categories?.slug || ''
                
                // Vợt Pickleball: show thickness options
                if (catSlug === 'vot-pickleball') {
                  const thicknessOptions = ['14mm', '16mm']
                  const specThickness = product.specs?.['Độ dày'] || product.specs?.['Thickness'] || null
                  return (
                    <div className="space-y-3">
                      <label className="text-base font-medium text-foreground opacity-80">Độ dày mặt vợt:</label>
                      <div className="flex items-center gap-3">
                        {thicknessOptions.map((t) => {
                          const isMatch = specThickness ? specThickness.includes(t.replace('mm','')) : t === '16mm'
                          return (
                            <span
                              key={t}
                              className={`px-5 py-2.5 rounded-xl border-2 text-sm font-bold cursor-default transition-all ${isMatch ? 'border-lime-dark bg-lime/10 text-lime-dark shadow-sm' : 'border-border text-muted-foreground bg-muted/30'}`}
                            >
                              {t}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )
                }
                
                // Quần áo: show size + color
                if (catSlug === 'quan-ao') {
                  const sizes = ['S', 'M', 'L', 'XL', 'XXL']
                  const fallbackColors = ['#FDE047', '#93C5FD', '#F472B6', '#D6D3D1', '#15803D', '#EF4444', '#A855F7']
                  const images = product.product_images || []
                  return (
                    <>
                      <div className="space-y-3">
                        <label className="text-base font-medium text-foreground opacity-80">Size:</label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {sizes.map((s) => (
                            <span
                              key={s}
                              className="px-4 py-2 rounded-xl border-2 border-border text-sm font-bold cursor-default text-foreground hover:border-lime/50 transition-all bg-white"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-base font-medium text-foreground opacity-80">Màu sắc:</label>
                        <div className="flex items-center gap-3">
                          {images.length === 0 ? (
                            <span className="text-xs text-muted-foreground">Mặc định</span>
                          ) : (
                            images.map((img, idx) => {
                              const colorHex = (img as any).color_code || fallbackColors[idx % fallbackColors.length]
                              const colorName = (img as any).color_name || `Màu ${idx + 1}`
                              const isSelected = selectedImage === img.url || (!selectedImage && idx === 0)
                              return (
                                <button 
                                  key={img.id} 
                                  onClick={() => setSelectedImage(img.url)}
                                  className={`w-10 h-10 rounded-xl border-2 transition-all shadow-sm ${isSelected ? 'border-lime-dark scale-110' : 'border-border hover:border-lime/50'} p-0.5 relative group/btn`}
                                  title={colorName}
                                >
                                  <div className="w-full h-full rounded-lg flex items-center justify-center" style={{ backgroundColor: colorHex }}>
                                    {isSelected && <Check className="w-5 h-5 text-white drop-shadow-md" style={{ filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.5))' }} />}
                                  </div>
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                    {colorName}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/80 rotate-45"></div>
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
                
                // Default for other categories: no color/size section
                return null
              })()}
            </div>

            {/* Actions (Quantity + Buttons) */}
            <div className="space-y-5 pt-6 border-t border-border/50 mt-2">
              <div className="space-y-2">
                <label className="text-base font-medium text-foreground opacity-80">Số lượng:</label>
                <div className="flex items-center w-max rounded-xl border border-border bg-white shadow-sm overflow-hidden">
                  <button className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={!inStock}>
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 h-12 flex items-center justify-center font-bold text-base border-x border-border/50 bg-gray-50/50">{quantity}</span>
                  <button className="w-12 h-12 flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={!inStock}>
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full">
                {/* Mua ngay - Main Call to Action */}
                <button 
                  className="flex-1 h-14 rounded-2xl text-lg font-bold transition-all active:scale-95 shadow-lg shadow-lime/30 bg-gradient-to-r from-lime-dark to-lime hover:opacity-90 text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none" 
                  disabled={!inStock} 
                  onClick={() => {
                    handleAddToCart();
                    window.location.href = '/checkout';
                  }}
                >
                  Mua ngay
                </button>

                {/* Add to cart icon */}
                <button 
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 active:scale-95 shadow-sm ${addedToCart ? 'bg-lime text-lime-dark border-lime' : 'bg-white border-border hover:border-lime-dark text-foreground'}`}
                  disabled={!inStock} 
                  onClick={handleAddToCart}
                  title="Thêm vào giỏ hàng"
                >
                  {addedToCart ? <Check className="h-6 w-6" /> : <ShoppingCart className="h-6 w-6" />}
                </button>

                {/* Wishlist icon */}
                <button 
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 active:scale-95 shadow-sm bg-white ${liked ? 'border-red-500 text-red-500 bg-red-50/50' : 'border-border hover:border-red-400 text-foreground'}`}
                  disabled={!inStock} 
                  onClick={() => setLiked(!liked)}
                  title="Yêu thích"
                >
                  <Heart className={`h-6 w-6 ${liked ? 'fill-current' : ''}`} />
                </button>
              </div>
              
              <div className="flex items-center gap-3 pt-3">
                <span className="flex items-center gap-2 text-base text-muted-foreground">
                  Danh mục: 
                  <Link href={`/products?category=${product.categories?.slug || ''}`} className="text-lime-dark font-extrabold text-lg hover:underline transition-all">
                    {product.categories?.name || 'Vợt Pickleball'}
                  </Link>
                </span>
              </div>
            </div>

            {/* Tabs: Mô tả & Thông số */}
            <div className="mt-8">
              <Tabs defaultValue="specs">
                <TabsList className="rounded-xl bg-muted p-1 inline-flex w-full overflow-x-auto">
                  <TabsTrigger value="specs" className="rounded-lg flex-1 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm text-sm font-medium">Thông số kỹ thuật</TabsTrigger>
                  <TabsTrigger value="description" className="rounded-lg flex-1 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm text-sm font-medium">Mô tả chi tiết</TabsTrigger>
                </TabsList>

                <TabsContent value="specs" className="mt-6">
                  {product.specs ? (
                    <div className="rounded-2xl border border-border overflow-hidden bg-white">
                      {Object.entries(product.specs).map(([key, value], i) => (
                        <div key={key} className={`flex ${i % 2 === 0 ? 'bg-muted/30' : 'bg-transparent'}`}>
                          <span className="w-[40%] px-5 py-4 text-sm font-medium text-muted-foreground border-r border-border">{key}</span>
                          <span className="flex-1 px-5 py-4 text-sm font-medium text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center border rounded-2xl border-dashed">
                      <p className="text-muted-foreground">Chưa có thông số kỹ thuật.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="description" className="mt-6">
                  <div className="p-6 rounded-2xl bg-white border border-border shadow-sm">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{product.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-foreground">Sản phẩm liên quan</h2>
              <Link href="/products" className="text-sm font-medium text-lime-dark hover:underline flex items-center gap-1">
                Xem tất cả <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p: any) => (
                <Link href={`/products/${p.slug}`} key={p.id} className="group block rounded-3xl bg-gradient-to-br from-lime/5 to-lime-light/10 border border-lime/20 p-4 hover:border-lime/50 transition-all">
                  <div className="aspect-square rounded-2xl bg-white/50 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <span className="text-6xl">{emoji}</span>
                  </div>
                  <p className="text-xs font-medium text-lime-dark uppercase">{p.brand}</p>
                  <h3 className="font-bold text-sm text-foreground line-clamp-2 mb-1">{p.name}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-muted-foreground">{p.brand}</span>
                  </div>
                  <p className="font-bold text-lime-dark mt-1">{formatPrice(p.price)}</p>
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
