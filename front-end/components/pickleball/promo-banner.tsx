import { Button } from "@/components/ui/button"
import Link from "next/link"

export function PromoBanner() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400">
          {/* Background Decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          </div>

          <div className="relative px-6 py-12 md:py-16 text-center">
            {/* Mascot placeholder */}
            <div className="absolute left-4 md:left-12 bottom-0 text-6xl md:text-8xl hidden sm:block">
              🏓
            </div>
            
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">
                PICKLEPRO CHÚC BẠN MỖI NGÀY
                <br />
                <span className="text-lime">CHƠI VUI VẺ VÀ CHIẾN THẮNG</span>
              </h2>
              
              <p className="text-gray-800 mb-6 text-sm md:text-base">
                Mong bạn sẽ tìm được chiếc vợt ưng ý, chốt deal nhẹ tênh,
                <br className="hidden md:block" />
                và được &ldquo;ace&rdquo; cùng đồng đội ngay từ game đầu tiên
              </p>

              <Link href="/contact">
                <Button className="bg-gradient-to-r from-[#c9deff] to-[#e7ff96] hover:opacity-90 text-black font-bold rounded-lg px-8 py-3 shadow-lg transition-all hover:scale-105">
                  GÓP Ý VỚI PICKLEPRO
                </Button>
              </Link>
            </div>

            {/* Decorative balls */}
            <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 text-6xl md:text-8xl hidden sm:block">
              🥎
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
