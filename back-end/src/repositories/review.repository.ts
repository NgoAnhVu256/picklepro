// ============================================
// Review Repository
// ============================================

import { supabaseAdmin } from '../config/supabase'
import type { Review, ReviewInsert } from '../types/database'

export class ReviewRepository {
  async findByProductId(productId: string, page = 1, limit = 10): Promise<{ data: Review[]; total: number }> {
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabaseAdmin
      .from('reviews')
      .select('*', { count: 'exact' })
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    return { data: data ?? [], total: count ?? 0 }
  }

  async create(review: ReviewInsert): Promise<Review> {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert(review)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async findByUserAndProduct(userId: string, productId: string): Promise<Review | null> {
    const { data, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    if (error && error.code === 'PGRST116') return null
    if (error) throw error
    return data
  }

  async delete(id: string, userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  }
}
