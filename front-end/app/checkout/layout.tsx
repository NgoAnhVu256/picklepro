import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Thanh toán',
  description: 'Thanh toán đơn hàng PicklePro. Hỗ trợ VNPay, chuyển khoản ngân hàng và COD.',
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
