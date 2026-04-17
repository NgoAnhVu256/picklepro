import type { Metadata } from 'next'
import { ChatWidgetWrapper } from '@/components/pickleball/chat-widget-wrapper'
import { ZaloWidgetWrapper } from '@/components/pickleball/zalo-widget-wrapper'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import { ToastProvider } from '@/components/ui/toast-provider'
import './globals.css'

import { createClient } from '@supabase/supabase-js'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

// Helper: fetch site settings từ Supabase (server-side, cached 60s)
async function getSiteSettings() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'system_settings')
      .single()
    return (data?.value as Record<string, any>) ?? null
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()

  const storeName = s?.store_name || 'PicklePro'
  const logoUrl   = s?.logo_url   || '/logo.png'
  const seoTitle  = s?.seo_title  || `${storeName} - Cửa hàng Vợt Pickleball cao cấp số 1 Việt Nam`
  const seoDesc   = s?.seo_description || 'Cửa hàng vợt Pickleball cao cấp số 1 Việt Nam. Đa dạng thương hiệu JOOLA, Selkirk, Paddletek, HEAD. Bảo hành chính hãng, giao hàng toàn quốc.'
  const ogImage   = s?.og_image_url || '/og-image.png'

  return {
    metadataBase: new URL(APP_URL),
    title: {
      default: seoTitle,
      template: `%s | ${storeName}`,
    },
    description: seoDesc,
    keywords: (s?.seo_keywords || 'pickleball,vợt pickleball,picklepro,JOOLA,Selkirk,HEAD').split(',').map((k: string) => k.trim()),
    authors: [{ name: storeName, url: APP_URL }],
    creator: storeName,
    publisher: storeName,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    openGraph: {
      type: 'website',
      locale: 'vi_VN',
      url: APP_URL,
      siteName: storeName,
      title: seoTitle,
      description: seoDesc,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${storeName} - Vợt Pickleball cao cấp` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${storeName} - Vợt Pickleball cao cấp`,
      description: seoDesc,
      images: [ogImage],
    },
    icons: {
      icon: [
        { url: logoUrl, type: logoUrl.endsWith('.svg') ? 'image/svg+xml' : 'image/png' },
        { url: '/favicon.ico', sizes: '32x32' },
      ],
      apple: logoUrl,
      shortcut: logoUrl,
    },
    alternates: { canonical: APP_URL },
    category: 'ecommerce',
  }
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
    <html lang="vi" suppressHydrationWarning>
      <head>
        {/* Preconnect — DNS+TLS song song, tiết kiệm 200-400ms */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://xvkotjznfupazecaaucl.supabase.co" />
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
      <body className="font-sans antialiased overflow-x-hidden w-full" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
        <ToastProvider>
          <Providers>
            {children}
            <ChatWidgetWrapper />
            <ZaloWidgetWrapper />
            <Toaster position="bottom-right" richColors />
          </Providers>
        </ToastProvider>
      </body>
    </html>
  )
}
