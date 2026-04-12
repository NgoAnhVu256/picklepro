// ============================================
// Product Validators (Zod Schemas)
// Validate & sanitize mọi input trước khi xử lý
// ============================================

import { z } from 'zod'

// Filter sản phẩm (query params từ client)
export const productFilterSchema = z.object({
  search: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
  categorySlug: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  isFeatured: z.coerce.boolean().optional(),
  tags: z.array(z.string()).optional(),
  sortBy: z.enum(['price', 'rating', 'created_at', 'name']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(12),
}).transform(data => ({
  ...data,
  categorySlug: data.categorySlug || data.category || undefined,
}))

// Tạo sản phẩm mới (Admin)
export const createProductSchema = z.object({
  name: z.string().min(3, 'Tên sản phẩm tối thiểu 3 ký tự').max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  description: z.string().max(5000).optional(),
  brand: z.string().min(1, 'Thương hiệu không được để trống').max(100),
  price: z.number().min(1000, 'Giá tối thiểu 1.000 VND'),
  original_price: z.number().min(0).optional(),
  category_id: z.string().uuid('Category ID không hợp lệ'),
  stock: z.number().min(0).default(0),
  tags: z.array(z.string()).optional().default([]),
  specs: z.record(z.string(), z.string()).optional(),
  is_featured: z.boolean().optional().default(false),
  images: z.array(z.object({
    url: z.string().url('URL ảnh không hợp lệ'),
    is_primary: z.boolean(),
  })).optional(),
})

// Cập nhật sản phẩm (Admin)
export const updateProductSchema = createProductSchema.partial()

// Validate product slug
export const productSlugSchema = z.string()
  .min(1)
  .max(200)
  .regex(/^[a-z0-9-]+$/, 'Slug không hợp lệ')
