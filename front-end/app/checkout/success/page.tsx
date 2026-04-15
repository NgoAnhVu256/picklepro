'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import { Button } from '@/components/ui/button'
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react'
import Link from 'next/link'

export default function CheckoutSuccessPage() {
  const [confetti, setConfetti] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setConfetti(false), 3000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f8fafc] to-[#f1f5f9]">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto text-center relative">
          {/* Glow */}
          <div className="absolute -inset-8 bg-gradient-to-r from-lime/30 via-lime-light/40 to-lime/30 rounded-[3rem] blur-3xl opacity-50" />

          <div className="relative bg-card/80 backdrop-blur-xl border border-lime/20 rounded-3xl p-10 shadow-xl">
            {/* Success Icon */}
            <div className="relative mb-6">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-lime to-lime-dark ${confetti ? 'animate-bounce' : ''}`}>
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              {confetti && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {['🎉', '🎊', '✨', '⭐', '🎁'].map((e, i) => (
                    <span key={i} className="absolute text-2xl animate-ping" style={{
                      animationDelay: `${i * 200}ms`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                    }}>{e}</span>
                  ))}
                </div>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-foreground mb-2">Đặt Hàng Thành Công!</h1>
            <p className="text-muted-foreground mb-6">
              Cảm ơn bạn đã mua sắm tại PicklePro. Đơn hàng của bạn đang được xử lý.
            </p>

            {/* Order Info */}
            <div className="rounded-2xl bg-lime/10 border border-lime/20 p-4 mb-6 text-left space-y-3">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-lime-dark" />
                <div>
                  <p className="text-sm font-bold text-foreground">Dự kiến giao hàng</p>
                  <p className="text-sm text-muted-foreground">3-5 ngày làm việc</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Bạn sẽ nhận được email xác nhận đơn hàng. Theo dõi đơn hàng trong mục <b>Tài khoản → Đơn hàng</b>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/account/orders" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl h-12 border-lime/30 hover:bg-lime/10 font-bold">
                  <Package className="h-4 w-4 mr-2" /> Xem đơn hàng
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button className="w-full rounded-xl h-12 bg-lime-dark hover:bg-lime-dark/80 text-white font-bold shadow-lg shadow-lime-dark/20">
                  <Home className="h-4 w-4 mr-2" /> Về trang chủ
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
