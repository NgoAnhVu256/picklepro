import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chính sách bảo mật',
  description: 'Chính sách bảo mật thông tin khách hàng tại PicklePro. Cam kết bảo vệ dữ liệu cá nhân theo quy định pháp luật Việt Nam.',
  openGraph: { title: 'Chính sách bảo mật | PicklePro' },
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  const sections = [
    { title: '1. Thu thập thông tin', content: 'PicklePro thu thập các thông tin cá nhân khi bạn đăng ký tài khoản, đặt hàng hoặc liên hệ với chúng tôi, bao gồm: Họ tên, số điện thoại, email, địa chỉ giao hàng. Chúng tôi không thu thập thông tin thẻ ngân hàng — việc thanh toán được xử lý qua cổng VNPay bảo mật.' },
    { title: '2. Sử dụng thông tin', content: 'Thông tin của bạn được sử dụng để: Xử lý và giao đơn hàng, liên hệ xác nhận đơn hàng, gửi thông báo khuyến mãi (nếu bạn đồng ý), cải thiện trải nghiệm mua sắm và tư vấn sản phẩm qua AI Chatbot.' },
    { title: '3. Bảo mật dữ liệu', content: 'PicklePro sử dụng mã hóa SSL/TLS cho toàn bộ website, xác thực hai lớp qua Supabase Auth, và mã hóa HMAC-SHA512 cho giao dịch VNPay. Dữ liệu được lưu trữ trên hệ thống Supabase với tiêu chuẩn bảo mật SOC 2.' },
    { title: '4. Chia sẻ thông tin', content: 'Chúng tôi KHÔNG bán hoặc chia sẻ thông tin cá nhân cho bên thứ ba, ngoại trừ: Đối tác vận chuyển (để giao hàng), cổng thanh toán VNPay (để xử lý giao dịch), hoặc theo yêu cầu của cơ quan pháp luật.' },
    { title: '5. Quyền của khách hàng', content: 'Bạn có quyền: Yêu cầu xóa tài khoản và dữ liệu cá nhân, cập nhật thông tin bất kỳ lúc nào, từ chối nhận email marketing, yêu cầu bản sao dữ liệu cá nhân.' },
    { title: '6. Liên hệ', content: 'Nếu có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên hệ: Email support@picklepro.vn hoặc Hotline 0912 345 678.' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Chính sách bảo mật</h1>
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
