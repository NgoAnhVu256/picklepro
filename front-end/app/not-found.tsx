import Link from 'next/link'
import { Home, MoveLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md w-full animate-in fade-in zoom-in duration-500">
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-lime/20 rounded-full animate-ping" />
          <div className="relative flex items-center justify-center w-full h-full bg-background rounded-full border-4 border-border shadow-xl">
            <span className="text-5xl">🏓</span>
          </div>
          {/* Bóng bay lơ lửng */}
          <div className="absolute top-0 right-0 w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-500 animate-bounce shadow-lg shadow-yellow-500/50" />
        </div>
        
        <h1 className="text-6xl font-black text-foreground mb-4 tabular-nums tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-3">Lệch Vạch Kẻ Sân!</h2>
        <p className="text-muted-foreground mb-8 text-sm">
          Nhịp bóng của bạn đã rơi ra ngoài vạch. Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển đi nơi khác.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-lime text-lime-dark font-bold hover:bg-lime-dark hover:text-white transition-all shadow-lg hover:shadow-lime/50 group">
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Về trang chủ
          </Link>
          <button onClick={() => window.history.back()} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-muted text-foreground font-medium hover:bg-muted/80 transition-all border border-border group">
            <MoveLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Trở lại thao tác
          </button>
        </div>
      </div>
    </div>
  )
}
