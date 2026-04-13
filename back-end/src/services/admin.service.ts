// ============================================
// Admin Service
// Business logic cho Admin Dashboard
// Dùng supabaseAdmin (service role) — bypass RLS
// ============================================

import { supabaseAdmin } from '../config/supabase'
import { ServiceError } from './product.service'

export class AdminService {
  // ============================================
  // STATS — Dashboard tổng quan
  // ============================================

  async getDashboardStats() {
    const [
      { count: totalProducts },
      { count: totalOrders },
      { count: totalCustomers },
      revenueResult,
      recentOrders,
      topProducts,
      monthlyRevenue,
    ] = await Promise.all([
      supabaseAdmin.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('orders').select('total_amount').eq('status', 'completed'),
      supabaseAdmin
        .from('orders')
        .select('id, total_amount, status, shipping_name, created_at, shipping_phone')
        .order('created_at', { ascending: false })
        .limit(8),
      supabaseAdmin
        .from('order_items')
        .select('product_id, quantity, products(name, brand, price, slug)')
        .limit(100),
      supabaseAdmin
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true }),
    ])

    // Tính tổng doanh thu
    const totalRevenue = (revenueResult.data ?? []).reduce((sum, o) => sum + o.total_amount, 0)

    // Aggregate top products
    const productSales: Record<string, { name: string; brand: string; slug: string; qty: number; revenue: number }> = {}
    for (const item of topProducts.data ?? []) {
      const p = item.products as any
      if (!p) continue
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = { name: p.name, brand: p.brand, slug: p.slug, qty: 0, revenue: 0 }
      }
      productSales[item.product_id].qty += item.quantity
      productSales[item.product_id].revenue += item.quantity * p.price
    }
    const topProductsList = Object.values(productSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)

    // Aggregate monthly revenue (6 tháng gần nhất)
    const monthMap: Record<string, number> = {}
    for (const o of monthlyRevenue.data ?? []) {
      const month = o.created_at.slice(0, 7) // "2026-04"
      monthMap[month] = (monthMap[month] ?? 0) + o.total_amount
    }
    const months = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, revenue]) => ({ month, revenue }))

    return {
      stats: {
        totalRevenue,
        totalOrders: totalOrders ?? 0,
        totalProducts: totalProducts ?? 0,
        totalCustomers: totalCustomers ?? 0,
      },
      recentOrders: recentOrders.data ?? [],
      topProducts: topProductsList,
      monthlyRevenue: months,
    }
  }

  // ============================================
  // PRODUCTS — CRUD Admin
  // ============================================

  async getAdminProducts(page = 1, limit = 20, search = '') {
    let query = supabaseAdmin
      .from('products')
      .select('*, categories(name, slug)', { count: 'exact' })

    if (search) query = query.ilike('name', `%${search}%`)

    const from = (page - 1) * limit
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (error) throw error
    return { products: data ?? [], total: count ?? 0, page, limit }
  }

  async createProduct(payload: any) {
    const slug = payload.slug || this.generateSlug(payload.name)
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({ ...payload, slug })
      .select()
      .single()

    if (error) throw new ServiceError('CREATE_FAILED', error.message)
    return data
  }

  async updateProduct(id: string, payload: any) {
    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new ServiceError('UPDATE_FAILED', error.message)
    return data
  }

  async deleteProduct(id: string) {
    // Soft delete — không xóa khỏi DB
    const { error } = await supabaseAdmin
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw new ServiceError('DELETE_FAILED', error.message)
    return { success: true }
  }

  // ============================================
  // CATEGORIES — CRUD Admin
  // ============================================

  async getAdminCategories() {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*, products(count)')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  }

  async createCategory(payload: any) {
    const slug = payload.slug || this.generateSlug(payload.name)
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({ ...payload, slug })
      .select()
      .single()

    if (error) throw new ServiceError('CREATE_FAILED', error.message)
    return data
  }

  async updateCategory(id: string, payload: any) {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new ServiceError('UPDATE_FAILED', error.message)
    return data
  }

  async deleteCategory(id: string) {
    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id)
    if (error) throw new ServiceError('DELETE_FAILED', error.message)
    return { success: true }
  }

  // ============================================
  // ORDERS — Admin management
  // ============================================

  async getAdminOrders(page = 1, limit = 20, status = '') {
    let query = supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' })

    if (status) query = query.eq('status', status)

    const from = (page - 1) * limit
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (error) throw error
    return { orders: data ?? [], total: count ?? 0, page, limit }
  }

  async getAdminOrderDetail(orderId: string) {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(name, brand, slug))')
      .eq('id', orderId)
      .single()

    if (error) throw new ServiceError('ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng', 404)
    return data
  }

  async updateOrderStatus(orderId: string, status: string) {
    const validStatuses = ['pending', 'paid', 'shipping', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      throw new ServiceError('INVALID_STATUS', 'Trạng thái không hợp lệ')
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw new ServiceError('UPDATE_FAILED', error.message)
    return data
  }

  // ============================================
  // CUSTOMERS — Admin view
  // ============================================

  async getAdminCustomers(page = 1, limit = 20, search = '') {
    let query = supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, address, role, updated_at', { count: 'exact' })

    if (search) query = query.ilike('full_name', `%${search}%`)

    const from = (page - 1) * limit
    const { data, error, count } = await query
      .order('updated_at', { ascending: false })
      .range(from, from + limit - 1)

    if (error) throw error

    // Lấy thêm số đơn hàng cho mỗi user
    const userIds = (data ?? []).map((u) => u.id)
    const orderCounts: Record<string, number> = {}

    if (userIds.length > 0) {
      const { data: orderData } = await supabaseAdmin
        .from('orders')
        .select('user_id')
        .in('user_id', userIds)

      for (const o of orderData ?? []) {
        orderCounts[o.user_id] = (orderCounts[o.user_id] ?? 0) + 1
      }
    }

    return {
      customers: (data ?? []).map((u) => ({ ...u, orderCount: orderCounts[u.id] ?? 0 })),
      total: count ?? 0,
      page,
      limit,
    }
  }

  // ============================================
  // AUTH — Verify admin
  // ============================================

  async verifyAdmin(userId: string): Promise<boolean> {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    return data?.role === 'admin'
  }

  // ============================================
  // Helpers
  // ============================================

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
}
