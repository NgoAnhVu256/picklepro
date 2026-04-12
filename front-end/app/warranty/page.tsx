import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chính sách bảo hành',
  description: 'Chính sách bảo hành sản phẩm Pickleball tại PicklePro. Bảo hành chính hãng 12 tháng, đổi trả miễn phí 30 ngày.',
  openGraph: { title: 'Chính sách bảo hành | PicklePro' },
  alternates: { canonical: '/warranty' },
}

export default function WarrantyPage() {
  const policies = [
    { title: '🛡️ Bảo hành chính hãng', items: ['Bảo hành 12 tháng cho tất cả vợt Pickleball', 'Bảo hành 6 tháng cho phụ kiện', 'Chỉ bảo hành lỗi do nhà sản xuất'] },
    { title: '🔄 Chính sách đổi trả', items: ['Đổi trả miễn phí trong 30 ngày', 'Sản phẩm phải còn nguyên tem, nhãn mác', 'Hoàn tiền 100% nếu lỗi từ nhà sản xuất'] },
    { title: '📦 Quy trình bảo hành', items: ['Liên hệ Hotline: 0912 345 678', 'Gửi ảnh/video lỗi sản phẩm qua Zalo', 'Gửi sản phẩm về showroom hoặc qua bưu điện', 'Thời gian xử lý: 3-7 ngày làm việc'] },
    { title: '⚠️ Không áp dụng bảo hành', items: ['Hư hỏng do sử dụng sai cách', 'Sản phẩm đã qua sửa chữa bên ngoài', 'Hết thời hạn bảo hành', 'Hư hỏng do thiên tai, tai nạn'] },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Chính sách bảo hành</h1>
        <p className="text-muted-foreground mb-8">Cam kết bảo hành chính hãng, đổi trả dễ dàng tại PicklePro.</p>
        <div className="space-y-8">
          {policies.map((p) => (
            <section key={p.title} className="p-6 rounded-2xl border border-lime/20 bg-gradient-to-br from-lime/5 to-transparent">
              <h2 className="text-xl font-bold text-foreground mb-4">{p.title}</h2>
              <ul className="space-y-2">
                {p.items.map((item) => (
                  <li key={item} className="flex gap-3 text-muted-foreground">
                    <span className="text-lime-dark font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
