import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sản phẩm Pickleball - Vợt, Phụ kiện, Combo',
  description: 'Khám phá bộ sưu tập vợt và phụ kiện Pickleball từ JOOLA, Selkirk, HEAD, Paddletek. Đa dạng mẫu mã, giá tốt nhất, bảo hành chính hãng.',
  openGraph: {
    title: 'Sản phẩm Pickleball | PicklePro',
    description: 'Vợt, phụ kiện Pickleball cao cấp. Giao hàng toàn quốc.',
  },
  alternates: { canonical: '/products' },
}

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return children
}
