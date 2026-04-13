'use client'

import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import { Button } from '@/components/ui/button'
import { Minus, Plus, X, ShoppingCart, ArrowRight, ArrowLeft, Truck, Tag } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
}

const productEmojis: Record<string, string> = {
  'vot-pickleball': '🏓', 'bong-pickleball': '⚾', 'tui-balo': '🎒', 'phu-kien-grip': '🧤',
  'giay-the-thao': '👟', 'quan-ao': '👕', 'luoi-san': '🥅', 'combo-tiet-kiem': '🎁',
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getTotalItems } = useCart()

  const totalPrice = getTotalPrice()
  const totalItems = getTotalItems()
  const freeShipping = totalPrice >= 500000
  const shippingFee = freeShipping ? 0 : 30000

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-lime/10 mb-6">
            <ShoppingCart className="h-12 w-12 text-lime-dark" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-2">Giỏ hàng trống</h2>
          <p className="text-muted-foreground mb-6">Hãy khám phá các sản phẩm Pickleball tuyệt vời!</p>
          <Link href="/products">
            <Button className="rounded-full bg-lime-dark hover:bg-lime-dark/80 text-white px-8 h-12 text-base font-bold shadow-lg shadow-lime-dark/20">
              Khám phá ngay <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Giỏ Hàng</h1>
            <p className="text-muted-foreground">{totalItems} sản phẩm</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-full border-red-500/30 text-red-500 hover:bg-red-500/10" onClick={clearCart}>
            <X className="h-4 w-4 mr-1" /> Xóa tất cả
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 p-4 rounded-2xl border border-lime/20 bg-gradient-to-r from-lime/5 to-transparent hover:border-lime/40 transition-all group">
                {/* Image */}
                <Link href={`/products/${item.slug}`} className="shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-xl bg-white/50 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="text-5xl">🏓</span>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-lime-dark uppercase">{item.brand}</p>
                      <Link href={`/products/${item.slug}`}>
                        <h3 className="font-bold text-foreground line-clamp-2 hover:text-lime-dark transition-colors">{item.name}</h3>
                      </Link>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="shrink-0 p-1.5 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-3">
                    {/* Quantity */}
                    <div className="flex items-center rounded-full border border-lime/30 overflow-hidden">
                      <button className="px-3 py-1.5 hover:bg-lime/10 transition-colors" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 py-1.5 font-bold text-sm min-w-[36px] text-center">{item.quantity}</span>
                      <button className="px-3 py-1.5 hover:bg-lime/10 transition-colors" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Price */}
                    <span className="font-bold text-lg text-lime-dark">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-3xl border border-lime/20 bg-gradient-to-b from-lime/5 to-transparent p-6 space-y-4">
                <h3 className="text-lg font-bold text-foreground">Tóm tắt đơn hàng</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính ({totalItems} sản phẩm)</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí vận chuyển</span>
                    <span className="font-medium">{freeShipping ? <span className="text-lime-dark">Miễn phí</span> : formatPrice(shippingFee)}</span>
                  </div>
                  {!freeShipping && (
                    <div className="flex items-center gap-2 text-xs text-lime-dark bg-lime/10 rounded-xl p-2.5">
                      <Truck className="h-4 w-4 shrink-0" />
                      Mua thêm {formatPrice(500000 - totalPrice)} để được <b>miễn phí vận chuyển</b>
                    </div>
                  )}
                  <div className="h-px bg-border" />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-foreground">Tổng cộng</span>
                    <span className="text-lime-dark">{formatPrice(totalPrice + shippingFee)}</span>
                  </div>
                </div>

                <Link href="/checkout" className="block">
                  <Button className="w-full rounded-xl h-14 text-base font-bold bg-lime-dark hover:bg-lime-dark/80 text-white transition-all shadow-lg shadow-lime-dark/20 active:scale-95">
                    Thanh toán <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
              </div>

              <Link href="/products" className="flex items-center justify-center gap-2 text-sm text-lime-dark hover:underline py-2">
                <ArrowLeft className="h-4 w-4" /> Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
