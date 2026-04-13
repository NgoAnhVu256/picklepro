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
          {/* Left — Image */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-lime/10 via-lime-light/20 to-lime/5 border border-lime/20 flex items-center justify-center relative overflow-hidden">
                {/* Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2 z-10">
                  {product.is_featured && <Badge className="bg-lime text-lime-dark text-sm font-bold px-3 py-1">⭐ Nổi bật</Badge>}
                  {discount && <Badge className="bg-red-500 text-white text-sm font-bold px-3 py-1">-{discount}%</Badge>}
                </div>

                {/* Actions */}
                <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                  <button className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${liked ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-sm text-muted-foreground hover:text-red-500 hover:bg-white'}`} onClick={() => setLiked(!liked)}>
                    <Heart className={`h-5 w-5 ${liked ? 'fill-white' : ''}`} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-lime-dark hover:bg-white transition-all shadow-md">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>

                {/* Glow */}
                <div className="absolute w-64 h-64 bg-lime/20 rounded-full blur-3xl" />
                <span className="text-[160px] relative z-10 drop-shadow-xl">{emoji}</span>
              </div>
            </div>
          </div>

          {/* Right — Info */}
          <div className="flex flex-col gap-5">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-lime-dark uppercase tracking-wider bg-lime/10 px-3 py-1 rounded-full">{product.brand}</span>
              {product.categories && <span className="text-sm text-muted-foreground">{product.categories.name}</span>}
            </div>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">{product.name}</h1>



            {/* Price */}
            <div className="flex items-end gap-3 bg-gradient-to-r from-lime/10 via-transparent to-transparent p-4 rounded-2xl">
              <span className="text-4xl font-extrabold text-lime-dark">{formatPrice(product.price)}</span>
              {product.original_price && (
                <div className="flex flex-col">
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
                  <span className="text-sm font-bold text-red-500">Tiết kiệm {formatPrice(product.original_price - product.price)}</span>
                </div>
              )}
            </div>

            {/* Stock */}
            <div className={`flex items-center gap-2 text-sm ${inStock ? 'text-lime-dark' : 'text-red-500'}`}>
              <div className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-lime-dark animate-pulse' : 'bg-red-500'}`} />
              {inStock ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-lime/10 text-lime-dark border border-lime/20">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center rounded-full border border-lime/30 overflow-hidden">
                <button className="px-4 py-3 hover:bg-lime/10 transition-colors" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={!inStock}>
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-3 font-bold text-lg min-w-[48px] text-center">{quantity}</span>
                <button className="px-4 py-3 hover:bg-lime/10 transition-colors" onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={!inStock}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button className={`flex-1 rounded-full h-14 text-lg font-bold transition-all active:scale-95 shadow-lg ${addedToCart ? 'bg-lime-dark text-white shadow-lime-dark/30' : 'bg-lime hover:bg-lime-dark text-lime-dark hover:text-white shadow-lime/30'}`} disabled={!inStock} onClick={handleAddToCart}>
                {addedToCart ? (
                  <><Check className="h-5 w-5 mr-2" /> Đã thêm!</>
                ) : (
                  <><ShoppingCart className="h-5 w-5 mr-2" /> Thêm vào giỏ</>
                )}
              </Button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Truck, label: 'Miễn phí vận chuyển', sub: 'Đơn từ 500K' },
                { icon: Shield, label: 'Bảo hành 12 tháng', sub: 'Chính hãng' },
                { icon: RotateCcw, label: 'Đổi trả 30 ngày', sub: 'Miễn phí' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center p-3 rounded-xl bg-gradient-to-b from-lime/5 to-transparent border border-lime/10">
                  <Icon className="h-5 w-5 mx-auto mb-1.5 text-lime-dark" />
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>

            {/* Tabs: Mô tả & Thông số */}
            <Tabs defaultValue="specs" className="mt-3">
              <TabsList className="rounded-full bg-lime/10 p-1">
                <TabsTrigger value="specs" className="rounded-full data-[state=active]:bg-lime data-[state=active]:text-lime-dark text-sm">Thông số kỹ thuật</TabsTrigger>
                <TabsTrigger value="description" className="rounded-full data-[state=active]:bg-lime data-[state=active]:text-lime-dark text-sm">Mô tả sản phẩm</TabsTrigger>
              </TabsList>

              <TabsContent value="specs" className="mt-4">
                {product.specs ? (
                  <div className="rounded-2xl border border-lime/20 overflow-hidden">
                    {Object.entries(product.specs).map(([key, value], i) => (
                      <div key={key} className={`flex ${i % 2 === 0 ? 'bg-lime/5' : 'bg-transparent'}`}>
                        <span className="w-1/3 px-4 py-3 text-sm font-medium text-muted-foreground border-r border-lime/10">{key}</span>
                        <span className="flex-1 px-4 py-3 text-sm font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Chưa có thông số kỹ thuật.</p>
                )}
              </TabsContent>

              <TabsContent value="description" className="mt-4">
                <p className="text-foreground leading-relaxed">{product.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
              </TabsContent>
            </Tabs>
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
