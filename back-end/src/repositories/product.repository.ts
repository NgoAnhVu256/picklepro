// ============================================
// Product Repository
// Chỉ chứa truy vấn DB thuần — KHÔNG CÓ business logic
// ============================================

import { supabaseAdmin } from '../config/supabase'
import type {
  Product,
  ProductWithCategory,
  ProductFull,
  ProductInsert,
  ProductUpdate,
} from '../types/database'
import type { ProductFilterDTO } from '../types/product.dto'

export class ProductRepository {
  /**
   * Lấy danh sách sản phẩm có filter, pagination, sort
   */
  async findAll(filter: ProductFilterDTO): Promise<{ data: ProductWithCategory[]; total: number }> {
    // If filtering by category slug, first lookup the category_id
    let categoryId: string | undefined
    if (filter.categorySlug) {
      const { data: cat } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('slug', filter.categorySlug)
        .single()
      if (cat) categoryId = cat.id
      else return { data: [], total: 0 } // Category not found → no results
    }

    let query = supabaseAdmin
      .from('products')
      .select('*, categories(name, slug)', { count: 'exact' })
      .eq('is_active', true)

    // --- Filters ---
    if (filter.search) {
      query = query.ilike('name', `%${filter.search}%`)
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }
    if (filter.brand) {
      query = query.eq('brand', filter.brand)
    }
    if (filter.minPrice !== undefined) {
      query = query.gte('price', filter.minPrice)
    }
    if (filter.maxPrice !== undefined) {
      query = query.lte('price', filter.maxPrice)
    }
    if (filter.isFeatured !== undefined) {
      query = query.eq('is_featured', filter.isFeatured)
    }

    // --- Pagination ---
    const page = filter.page ?? 1
    const limit = filter.limit ?? 12
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // --- Sort ---
    const sortBy = filter.sortBy ?? 'created_at'
    const ascending = filter.sortOrder === 'asc'
    query = query.order(sortBy, { ascending })

    const { data, error, count } = await query

    if (error) throw error
    return { data: (data ?? []) as ProductWithCategory[], total: count ?? 0 }
  }

  /**
   * Lấy chi tiết sản phẩm theo slug (bao gồm ảnh)
   */
  async findBySlug(slug: string): Promise<ProductFull | null> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*, categories(name, slug), product_images(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error && error.code === 'PGRST116') return null // Not found
    if (error) throw error
    return data as ProductFull
  }

  /**
   * Lấy sản phẩm theo ID
   */
  async findById(id: string): Promise<Product | null> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') return null
    if (error) throw error
    return data
  }

  /**
   * Lấy nhiều sản phẩm theo danh sách ID
   */
  async findByIds(ids: string[]): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .in('id', ids)
      .eq('is_active', true)

    if (error) throw error
    return data ?? []
  }

  /**
   * Tìm sản phẩm liên quan (cùng category, trừ sản phẩm hiện tại)
   */
  async findRelated(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .neq('id', productId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data ?? []
  }

  /**
   * Tìm kiếm cho RAG chatbot — tách từng keyword tìm riêng
   */
  async searchForRAG(keywords: string, limit = 10): Promise<Product[]> {
    // Tách keywords thành từng từ
    const words = keywords.split(/\s+/).filter(w => w.length > 1)

    if (words.length === 0) {
      // Không có keyword → lấy top sản phẩm nổi bật
      return this.getTopProducts(limit)
    }

    // Tạo điều kiện OR cho từng từ trên nhiều cột
    const conditions = words.flatMap(w => [
      `name.ilike.%${w}%`,
      `brand.ilike.%${w}%`,
      `description.ilike.%${w}%`,
    ])

    const { data, error } = await supabaseAdmin
      .from('products')
      .select('name, brand, price, description, specs, slug')
      .eq('is_active', true)
      .or(conditions.join(','))
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    // Nếu không tìm thấy → fallback lấy top sản phẩm
    if (!data || data.length === 0) {
      return this.getTopProducts(limit)
    }

    return data
  }

  /**
   * Lấy top sản phẩm (fallback khi không tìm thấy keyword)
   */
  async getTopProducts(limit = 10): Promise<Product[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('name, brand, price, description, specs, slug')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data ?? []
  }

  /**
   * Tạo sản phẩm mới (Admin)
   */
  async create(product: ProductInsert): Promise<Product> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(product)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Cập nhật sản phẩm (Admin)
   */
  async update(id: string, product: ProductUpdate): Promise<Product> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ ...product, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Lấy danh sách brand duy nhất (cho filter UI)
   */
  async getDistinctBrands(): Promise<string[]> {
    const { data, error } = await supabaseAdmin
      .from('products')
      .select('brand')
      .eq('is_active', true)

    if (error) throw error
    const brands = [...new Set((data ?? []).map((p) => p.brand))]
    return brands.sort()
  }
}
