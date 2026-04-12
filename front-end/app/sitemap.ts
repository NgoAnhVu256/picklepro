// ============================================
// Dynamic Sitemap — Tự động liệt kê tất cả trang
// ============================================

import { MetadataRoute } from 'next'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Trang tĩnh
  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${APP_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${APP_URL}/auth/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${APP_URL}/auth/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${APP_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${APP_URL}/warranty`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${APP_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${APP_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]

  // Trang sản phẩm động từ API
  let productPages: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${APP_URL}/api/products?limit=100`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      productPages = (data.products || []).map((p: any) => ({
        url: `${APP_URL}/products/${p.slug}`,
        lastModified: new Date(p.updated_at || p.created_at || Date.now()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch {
    // Nếu không fetch được → chỉ trả về trang tĩnh
  }

  return [...staticPages, ...productPages]
}
