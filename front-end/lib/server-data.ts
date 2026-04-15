// ============================================
// Server-Side Data Fetching
// Gọi thẳng từ Server Component, không qua API route
// ============================================

import { ProductService, BlogService } from '@picklepro/back-end'
import { createClient } from '@/lib/supabase/server'

const productService = new ProductService()
const blogService = new BlogService()

/**
 * Fetch toàn bộ dữ liệu trang chủ server-side
 * Gọi song song để tối đa tốc độ
 */
export async function getHomepageData() {
  const supabase = await createClient()

  const [
    productsResult,
    categories,
    slidesResult,
    blogsResult,
  ] = await Promise.all([
    // Sản phẩm mới nhất (8 items)
    productService.getProducts({
      limit: 8,
      sortBy: 'created_at',
      sortOrder: 'desc',
    }),
    // Danh mục
    productService.getCategories(),
    // Slides / Banners
    supabase
      .from('hero_slides')
      .select('*')
      .order('sort_order', { ascending: true }),
    // Blog posts
    blogService.getPublishedBlogs(1, 10),
  ])

  return {
    products: productsResult.products ?? [],
    categories: categories ?? [],
    slides: slidesResult.data ?? [],
    blogs: (blogsResult as any).blogs ?? [],
  }
}
