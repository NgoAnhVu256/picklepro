'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import { CheckCircle, XCircle, Loader2, ArrowRight, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function VNPayReturnContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Gửi toàn bộ query params về server để verify
        const params = new URLSearchParams()
        searchParams?.forEach((value, key) => params.set(key, value))

        const res = await fetch(`/api/vnpay-return?${params.toString()}`)
        const data = await res.json()

        if (data.success) {
          setStatus('success')
          setOrderId(data.orderId || '')
        } else {
          setStatus('failed')
        }
      } catch {
        setStatus('failed')
      }
    }

    verifyPayment()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-20 text-center">
        {status === 'loading' && (
          <div>
            <Loader2 className="h-16 w-16 animate-spin mx-auto text-lime-dark mb-4" />
            <h2 className="text-2xl font-bold mb-2">Đang xác nhận thanh toán...</h2>
            <p className="text-muted-foreground">Vui lòng chờ trong giây lát</p>
          </div>
        )}

        {status === 'success' && (
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-lime/20 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-lime-dark" />
            </div>
            <h2 className="text-3xl font-extrabold text-foreground mb-3">Thanh toán thành công! 🎉</h2>
            <p className="text-muted-foreground mb-8">
              Đơn hàng #{orderId.slice(0, 8)} đã được xác nhận. Chúng tôi sẽ xử lý và giao hàng sớm nhất.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/account/orders">
                <Button className="rounded-full bg-lime-dark hover:bg-lime-dark/80 text-white font-bold px-6">
                  <ShoppingBag className="h-4 w-4 mr-2" /> Xem đơn hàng
                </Button>
              </Link>
              <Link href="/products">
                <Button variant="outline" className="rounded-full border-lime/30 hover:bg-lime/10 px-6">
                  Tiếp tục mua sắm <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'failed' && (
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-extrabold text-foreground mb-3">Thanh toán thất bại</h2>
            <p className="text-muted-foreground mb-8">
              Giao dịch chưa được hoàn tất. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/cart">
                <Button className="rounded-full bg-lime-dark hover:bg-lime-dark/80 text-white font-bold px-6">
                  Quay lại giỏ hàng
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default function VNPayReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-lime-dark" />
      </div>
    }>
      <VNPayReturnContent />
    </Suspense>
  )
}
