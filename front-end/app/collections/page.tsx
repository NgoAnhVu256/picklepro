import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bộ Sưu Tập',
  description: 'Khám phá các bộ sưu tập Pickleball theo phong cách tạp chí thời trang thể thao. Từ combo người mới đến trang bị Pro Elite.',
}

const collections = [
  {
    id: 'combo-nguoi-moi',
    title: 'Combo Khởi Đầu Cho Người Mới',
    subtitle: 'Bắt đầu hành trình Pickleball với bộ trang bị hoàn hảo',
    description: 'Bộ sưu tập dành riêng cho người mới bắt đầu — từ vợt có trọng lượng vừa phải, bóng tiêu chuẩn đến túi và phụ kiện thiết yếu. Mọi thứ bạn cần để tự tin bước ra sân ngay lập tức.',
    href: '/products?category=combo-tiet-kiem',
    gradient: 'from-emerald-600 via-teal-700 to-cyan-800',
    accentColor: 'text-emerald-400',
    badge: 'Dành cho Newbie',
    emoji: '🌱',
  },
  {
    id: 'pro-elite',
    title: 'Đẳng Cấp Pro Elite',
    subtitle: 'Nâng tầm hiệu suất với thiết bị đỉnh cao',
    description: 'Được tuyển chọn từ các thương hiệu hàng đầu thế giới — JOOLA, Selkirk, HEAD. Mỗi sản phẩm đều được thiết kế để tối ưu hóa lực đánh, kiểm soát spin và tốc độ phản xạ cho những tay vợt chuyên nghiệp.',
    href: '/products?brand=JOOLA',
    gradient: 'from-slate-900 via-gray-800 to-zinc-900',
    accentColor: 'text-amber-400',
    badge: 'Premium Selection',
    emoji: '🏆',
  },
  {
    id: 'sac-mau-san-choi',
    title: 'Sắc Màu Sân Chơi',
    subtitle: 'Thể hiện cá tính riêng với phong cách đầy màu sắc',
    description: 'Bộ sưu tập quần áo, giày và phụ kiện với tông màu rực rỡ, năng động. Từ vợt phối màu Neon đến trang phục thể thao cá tính — tạo nên phong cách riêng trên mọi sân đấu.',
    href: '/products?category=quan-ao',
    gradient: 'from-purple-700 via-pink-600 to-rose-500',
    accentColor: 'text-pink-300',
    badge: 'Colorful Edition',
    emoji: '🎨',
  },
]

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f8fafc] to-[#f1f5f9]">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0c4a6e]" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-20 w-64 h-64 bg-lime/40 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-amber-500/30 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 relative text-center">
            <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-lime text-xs font-bold uppercase tracking-widest mb-6">
              Editorial Collection
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
              Bộ Sưu Tập<br className="sm:hidden" /> Pickleball
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Khám phá những bộ sưu tập được tuyển chọn theo phong cách — từ người mới bắt đầu đến vận động viên chuyên nghiệp.
            </p>
          </div>
        </section>

        {/* Collections */}
        <section className="container mx-auto px-4 py-12 space-y-8">
          {collections.map((col, index) => (
            <Link
              key={col.id}
              href={col.href}
              className="group block relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1"
            >
              <div className={`relative bg-gradient-to-br ${col.gradient} min-h-[320px] sm:min-h-[400px] p-8 sm:p-12 flex flex-col justify-end`}>
                {/* Decorative big emoji */}
                <div className="absolute top-8 right-8 sm:right-16 text-[120px] sm:text-[180px] opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700 select-none">
                  {col.emoji}
                </div>

                {/* Badge */}
                <div className="absolute top-6 left-6 sm:left-12">
                  <span className={`inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm ${col.accentColor} text-xs font-bold uppercase tracking-wider border border-white/10`}>
                    {col.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-2xl">
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 leading-tight group-hover:translate-x-2 transition-transform duration-500">
                    {col.title}
                  </h2>
                  <p className={`text-lg sm:text-xl font-semibold ${col.accentColor} mb-4`}>
                    {col.subtitle}
                  </p>
                  <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
                    {col.description}
                  </p>
                  <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-bold border border-white/20 group-hover:bg-white group-hover:text-gray-900 transition-all duration-300">
                    Khám phá bộ sưu tập
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>

                {/* Bottom gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
            </Link>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  )
}
