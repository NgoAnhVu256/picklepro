import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Không tìm thấy trang',
  description: 'Trang bạn tìm kiếm không tồn tại. Quay lại trang chủ PicklePro để tiếp tục mua sắm.',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lime/10 via-background to-lime/5 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <span className="text-8xl block mb-6">🏓</span>
        <h1 className="text-6xl font-extrabold text-foreground mb-2">404</h1>
        <h2 className="text-xl font-bold text-foreground mb-4">Trang không tồn tại</h2>
        <p className="text-muted-foreground mb-8">
          Có vẻ như trang bạn tìm kiếm đã bị di chuyển hoặc không tồn tại. Hãy quay lại trang chủ để tiếp tục khám phá!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-lime-dark hover:bg-lime-dark/80 text-white font-bold transition-all shadow-lg shadow-lime-dark/20"
          >
            🏠 Trang chủ
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 border-lime/30 hover:bg-lime/10 font-bold transition-all"
          >
            🛒 Xem sản phẩm
          </Link>
        </div>
      </div>
    </div>
  )
}
