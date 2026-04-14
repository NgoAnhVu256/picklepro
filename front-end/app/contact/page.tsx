import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Liên hệ',
  description: 'Liên hệ PicklePro - Cửa hàng Pickleball cao cấp. Hotline, email, địa chỉ showroom.',
  openGraph: { title: 'Liên hệ | PicklePro', description: 'Thông tin liên hệ PicklePro' },
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  const contacts = [
    { icon: Phone, label: 'Hotline', value: '0912 345 678', desc: 'Miễn phí cuộc gọi' },
    { icon: Mail, label: 'Email', value: 'support@picklepro.vn', desc: 'Phản hồi trong 24h' },
    { icon: MapPin, label: 'Showroom', value: '123 Nguyễn Huệ, Q.1, TP.HCM', desc: 'Mở cửa T2-CN' },
    { icon: Clock, label: 'Giờ làm việc', value: '8:00 - 21:00', desc: 'Thứ 2 đến Chủ nhật' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-extrabold text-foreground mb-2">Liên hệ PicklePro</h1>
        <p className="text-muted-foreground mb-8">Chúng tôi luôn sẵn sàng hỗ trợ bạn!</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          {contacts.map((c) => (
            <div key={c.label} className="flex gap-4 p-6 rounded-2xl border border-lime/30 bg-gradient-to-br from-lime/10 to-transparent">
              <div className="w-12 h-12 rounded-xl bg-lime/20 flex items-center justify-center shrink-0">
                <c.icon className="h-6 w-6 text-lime-dark" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-lg font-bold text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
