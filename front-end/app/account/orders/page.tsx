'use client'

import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import { Button } from '@/components/ui/button'
import { User, Package, LogOut, Loader2, ShoppingBag, ChevronRight, Clock, CheckCircle, Truck, XCircle, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface OrderItem {
  id: string
  product_id: string
  quantity: number
  unit_price: number
  products: { name: string; slug: string; brand: string }
}

interface Order {
  id: string
  status: string
  total_amount: number
  shipping_name: string
  shipping_address: string
  shipping_phone: string
  payment_method: string
  created_at: string
  order_items: OrderItem[]
}

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  paid: { label: 'Đã thanh toán', color: 'bg-lime/10 text-lime-dark border-lime/20', icon: CheckCircle },
  shipping: { label: 'Đang giao', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Truck },
  completed: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.status === 401) {
        router.push('/auth/login?redirect=/account/orders')
        return
      }
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <nav className="rounded-2xl border border-lime/10 overflow-hidden">
                <Link href="/account" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
                  <User className="h-4 w-4" /> Thông tin cá nhân
                </Link>
                <Link href="/account/orders" className="flex items-center gap-3 px-4 py-3 text-sm font-medium bg-lime/10 text-lime-dark border-l-3 border-lime-dark transition-colors">
                  <Package className="h-4 w-4" /> Đơn hàng của tôi
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 w-full transition-colors">
                  <LogOut className="h-4 w-4" /> Đăng xuất
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-extrabold text-foreground mb-6">Đơn hàng của tôi</h2>

            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-lime-dark" />
                <p className="text-muted-foreground mt-4">Đang tải đơn hàng...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-3xl border border-lime/20 bg-gradient-to-b from-lime/5 to-transparent p-12 text-center">
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold mb-2">Chưa có đơn hàng nào</h3>
                <p className="text-muted-foreground mb-6">Hãy khám phá cửa hàng và đặt đơn hàng đầu tiên!</p>
                <Link href="/products">
                  <Button className="rounded-full bg-lime hover:bg-lime-dark text-lime-dark hover:text-white font-bold">
                    Khám phá sản phẩm
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => {
                  const status = statusMap[order.status] || statusMap.pending
                  const StatusIcon = status.icon
                  return (
                    <div key={order.id} className="rounded-2xl border border-lime/20 bg-gradient-to-b from-lime/5 to-transparent p-5 hover:border-lime/40 transition-colors">
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {status.label}
                          </span>
                          <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CreditCard className="h-3 w-3" />
                            {order.payment_method === 'vnpay' ? 'VNPay' : order.payment_method === 'bank_transfer' ? 'Chuyển khoản' : order.payment_method === 'cod' ? 'COD' : 'Thẻ'}
                          </span>
                          <span className="text-lg font-bold text-lime-dark">{formatPrice(order.total_amount)}</span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.order_items?.map(item => (
                          <div key={item.id} className="flex items-center gap-3 py-1.5">
                            <div className="w-10 h-10 rounded-lg bg-lime/10 flex items-center justify-center shrink-0">
                              <span className="text-lg">🏓</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link href={`/products/${item.products?.slug || ''}`} className="text-sm font-medium hover:text-lime-dark transition-colors line-clamp-1">
                                {item.products?.name || 'Sản phẩm'}
                              </Link>
                              <p className="text-xs text-muted-foreground">{item.products?.brand} × {item.quantity}</p>
                            </div>
                            <span className="text-sm font-semibold whitespace-nowrap">{formatPrice(item.unit_price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="mt-3 pt-3 border-t border-lime/10 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Giao đến: {order.shipping_name} — {order.shipping_address}</span>
                        <span className="font-mono">#{order.id.slice(0, 8)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
