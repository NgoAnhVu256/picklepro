'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Home, RefreshCw, AlertOctagon } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md w-full animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-red-500/20">
          <AlertOctagon className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-5xl font-black text-foreground mb-3 tabular-nums tracking-tighter">500</h1>
        <h2 className="text-xl font-bold text-foreground mb-3">Lỗi Hệ Thống!</h2>
        <p className="text-muted-foreground mb-8 text-sm">
          Lưới sân đã gặp sự cố kĩ thuật. Chúng tôi đã ghi nhận và đang tiến hành sửa chữa. Vui lòng thử lại sau giây lát!
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={() => reset()} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-white transition-all shadow-lg hover:shadow-lime/50 group">
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Thử Khôi Phục
          </button>
          <Link href="/" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-muted text-foreground font-medium hover:bg-muted/80 transition-all border border-border group">
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}
