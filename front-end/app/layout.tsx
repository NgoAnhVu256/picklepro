import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ChatWidgetWrapper } from '@/components/pickleball/chat-widget-wrapper'
import './globals.css'

const _inter = Inter({ subsets: ["latin", "vietnamese"], variable: "--font-inter" });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'PicklePro - Cửa hàng Vợt Pickleball cao cấp số 1 Việt Nam',
    template: '%s | PicklePro',
  },
  description: 'Cửa hàng vợt Pickleball cao cấp số 1 Việt Nam. Đa dạng thương hiệu JOOLA, Selkirk, Paddletek, HEAD. Bảo hành chính hãng, giao hàng toàn quốc. Giá tốt nhất thị trường.',
  keywords: ['pickleball', 'vợt pickleball', 'phụ kiện pickleball', 'picklepro', 'mua vợt pickleball', 'pickleball việt nam', 'JOOLA', 'Selkirk', 'HEAD'],
  authors: [{ name: 'PicklePro', url: APP_URL }],
  creator: 'PicklePro',
  publisher: 'PicklePro',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: APP_URL,
    siteName: 'PicklePro',
    title: 'PicklePro - Cửa hàng Vợt Pickleball cao cấp số 1 Việt Nam',
    description: 'Đa dạng thương hiệu JOOLA, Selkirk, HEAD. Bảo hành chính hãng, giao hàng toàn quốc.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'PicklePro - Vợt Pickleball cao cấp' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PicklePro - Vợt Pickleball cao cấp',
    description: 'Cửa hàng Pickleball số 1 Việt Nam. JOOLA, Selkirk, HEAD. Bảo hành chính hãng.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  alternates: {
    canonical: APP_URL,
  },
  category: 'ecommerce',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PicklePro',
    url: APP_URL,
    logo: `${APP_URL}/icon.svg`,
    description: 'Cửa hàng vợt Pickleball cao cấp số 1 Việt Nam',
    contactPoint: { '@type': 'ContactPoint', telephone: '+84-xxx-xxx-xxx', contactType: 'customer service', areaServed: 'VN', availableLanguage: 'Vietnamese' },
    sameAs: ['https://facebook.com/picklepro', 'https://youtube.com/picklepro'],
  }

  return (
    <html lang="vi">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className={`${_inter.variable} font-sans antialiased`}>
        {children}
        <ChatWidgetWrapper />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
