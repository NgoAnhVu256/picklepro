// ============================================
// Order Repository
// ============================================

import { supabaseAdmin } from '../config/supabase'
import type {
  Order,
  OrderInsert,
  OrderUpdate,
  OrderItem,
  OrderItemInsert,
  OrderWithItems,
  OrderStatus,
} from '../types/database'

export class OrderRepository {
  /**
   * Tạo đơn hàng mới + order_items trong 1 transaction
   */
  async createWithItems(
    order: OrderInsert,
    items: Omit<OrderItemInsert, 'order_id'>[]
  ): Promise<Order> {
    // Tạo order
    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({ ...order, status: order.status ?? 'pending' })
      .select()
      .single()

    if (orderError) throw orderError

    // Tạo order items
    const orderItems: OrderItemInsert[] = items.map((item) => ({
      ...item,
      order_id: orderData.id,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return orderData
  }

  /**
   * Lấy danh sách đơn hàng của user (kèm items + product info)
   */
  async findByUserId(userId: string, page = 1, limit = 10): Promise<{ data: OrderWithItems[]; total: number }> {
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(name, slug, brand))', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data: (data ?? []) as OrderWithItems[], total: count ?? 0 }
  }

  /**
   * Lấy đơn hàng theo ID
   */
  async findById(id: string): Promise<OrderWithItems | null> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items(*, products(name, slug, brand))')
      .eq('id', id)
      .single()

    if (error && error.code === 'PGRST116') return null
    if (error) throw error
    return data as OrderWithItems
  }

  /**
   * Tìm đơn hàng theo Stripe session ID
   */
  async findByStripeSessionId(sessionId: string): Promise<Order | null> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single()

    if (error && error.code === 'PGRST116') return null
    if (error) throw error
    return data
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  /**
   * Cập nhật đơn hàng
   */
  async update(id: string, updates: OrderUpdate): Promise<Order> {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
