// ============================================
// Product DTOs (Data Transfer Objects)
// Định nghĩa shape của request/response API
// ============================================

import type { Product, ProductFull, ProductWithCategory } from './database'

// --- Request DTOs ---

export interface ProductFilterDTO {
  search?: string
  categorySlug?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  isFeatured?: boolean
  tags?: string[]
  sortBy?: 'price' | 'created_at' | 'name'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface CreateProductDTO {
  name: string
  slug: string
  description?: string
  brand: string
  price: number
  original_price?: number
  category_id: string
  stock: number
  tags?: string[]
  specs?: Record<string, string>
  is_featured?: boolean
  images?: { url: string; is_primary: boolean }[]
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

// --- Response DTOs ---

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ProductListResponse {
  products: ProductWithCategory[]
  pagination: PaginationMeta
}

export interface ProductDetailResponse {
  product: ProductFull
  relatedProducts: Product[]
}
