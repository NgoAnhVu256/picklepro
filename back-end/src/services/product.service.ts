// ============================================
// Product Service
// Business logic cho sản phẩm
// ============================================

import { ProductRepository } from '../repositories/product.repository'
import { CategoryRepository } from '../repositories/category.repository'
import { productFilterSchema } from '../validators/product.validator'
import type { ProductFilterDTO, ProductListResponse, ProductDetailResponse } from '../types/product.dto'
import type { Product } from '../types/database'

export class ProductService {
  private productRepo: ProductRepository
  private categoryRepo: CategoryRepository

  constructor() {
    this.productRepo = new ProductRepository()
    this.categoryRepo = new CategoryRepository()
  }

  /**
   * Lấy danh sách sản phẩm với filter + pagination
   */
  async getProducts(rawFilter: Record<string, unknown>): Promise<ProductListResponse> {
    const filter = productFilterSchema.parse(rawFilter) as ProductFilterDTO

    const { data, total } = await this.productRepo.findAll(filter)

    const limit = filter.limit ?? 12
    return {
      products: data,
      pagination: {
        page: filter.page ?? 1,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Lấy chi tiết sản phẩm theo slug
   */
  async getProductBySlug(slug: string): Promise<ProductDetailResponse> {
    const product = await this.productRepo.findBySlug(slug)

    if (!product) {
      throw new ServiceError('PRODUCT_NOT_FOUND', 'Không tìm thấy sản phẩm', 404)
    }

    const relatedProducts = await this.productRepo.findRelated(
      product.id,
      product.category_id,
      4
    )

    return { product, relatedProducts }
  }

  /**
   * Lấy sản phẩm nổi bật cho trang chủ
   */
  async getFeaturedProducts(limit = 6): Promise<Product[]> {
    const { data } = await this.productRepo.findAll({
      isFeatured: true,
      limit,
      sortBy: 'rating',
      sortOrder: 'desc',
    })
    return data
  }

  /**
   * Lấy danh sách categories
   */
  async getCategories() {
    return this.categoryRepo.findAll()
  }

  /**
   * Lấy danh sách brand cho filter sidebar
   */
  async getBrands(): Promise<string[]> {
    return this.productRepo.getDistinctBrands()
  }
}

// ============================================
// Custom Error class cho Services
// ============================================
export class ServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}
