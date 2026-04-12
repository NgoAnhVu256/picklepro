import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Giỏ hàng',
  description: 'Giỏ hàng của bạn tại PicklePro. Kiểm tra sản phẩm và tiến hành thanh toán.',
  robots: { index: false, follow: false },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
