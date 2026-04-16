import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ChatWidgetWrapper } from '@/components/pickleball/chat-widget-wrapper'
import { ZaloWidgetWrapper } from '@/components/pickleball/zalo-widget-wrapper'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import { ToastProvider } from '@/components/ui/toast-provider'
import './globals.css'

const _geistMono = Geist_Mono({ subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

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
    icon: '/favicon.ico',
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
    logo: `${APP_URL}/favicon.ico`,
    description: 'Cửa hàng vợt Pickleball cao cấp số 1 Việt Nam',
    contactPoint: { '@type': 'ContactPoint', telephone: '+84-xxx-xxx-xxx', contactType: 'customer service', areaServed: 'VN', availableLanguage: 'Vietnamese' },
    sameAs: ['https://facebook.com/picklepro', 'https://youtube.com/picklepro'],
  }

  return (
    <html lang="vi">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Product+Sans:wght@400;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {/* Google Analytics 4 */}
        {GA_MEASUREMENT_ID && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
            <script dangerouslySetInnerHTML={{ __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `}} />
          </>
        )}
      </head>
      <body className="font-sans antialiased overflow-x-hidden w-full" style={{ fontFamily: "'Google Sans', Inter, system-ui, sans-serif" }}>
        <ToastProvider>
          <Providers>
            {children}
            <ChatWidgetWrapper />
            <ZaloWidgetWrapper />
            <Toaster position="bottom-right" richColors />
            {process.env.NODE_ENV === 'production' && <Analytics />}
          </Providers>
        </ToastProvider>
      </body>
    </html>
  )
}
