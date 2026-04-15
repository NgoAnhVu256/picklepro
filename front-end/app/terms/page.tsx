import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng',
  description: 'Điều khoản sử dụng dịch vụ tại PicklePro. Quy định về mua hàng, thanh toán và giao nhận.',
  openGraph: { title: 'Điều khoản sử dụng | PicklePro' },
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  const sections = [
    { title: '1. Giới thiệu', content: 'Chào mừng bạn đến với PicklePro. Khi truy cập và sử dụng website picklepro.vn, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.' },
    { title: '2. Tài khoản', content: 'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập. Mỗi cá nhân chỉ được tạo một tài khoản. PicklePro có quyền khóa tài khoản vi phạm mà không cần thông báo trước.' },
    { title: '3. Đặt hàng & Thanh toán', content: 'Giá sản phẩm được niêm yết bằng VND và đã bao gồm VAT. Đơn hàng chỉ được xác nhận khi PicklePro gửi email/SMS xác nhận. Hỗ trợ thanh toán: COD, VNPay, chuyển khoản ngân hàng.' },
    { title: '4. Vận chuyển', content: 'Miễn phí vận chuyển cho đơn hàng từ 500.000đ. Thời gian giao hàng: 2-5 ngày (nội thành), 5-7 ngày (ngoại thành). PicklePro không chịu trách nhiệm về chậm trễ do bên vận chuyển.' },
    { title: '5. Sở hữu trí tuệ', content: 'Toàn bộ nội dung trên website (văn bản, hình ảnh, logo, thiết kế) thuộc quyền sở hữu của PicklePro. Nghiêm cấm sao chép, phân phối mà không có sự đồng ý bằng văn bản.' },
    { title: '6. Giới hạn trách nhiệm', content: 'PicklePro nỗ lực cung cấp thông tin chính xác nhưng không đảm bảo tuyệt đối. Chúng tôi không chịu trách nhiệm cho thiệt hại gián tiếp phát sinh từ việc sử dụng website.' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#f8fafc] to-[#f1f5f9]">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Điều khoản sử dụng</h1>
        <p className="text-muted-foreground mb-8">Cập nhật lần cuối: Tháng 4, 2026</p>
        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.title} className="p-6 rounded-2xl border border-lime/20 bg-gradient-to-br from-lime/5 to-transparent">
              <h2 className="text-xl font-bold text-foreground mb-3">{s.title}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.content}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
