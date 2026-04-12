// ============================================
// Category Repository
// ============================================

import { supabaseAdmin } from '../config/supabase'
import type { Category, CategoryInsert } from '../types/database'

export class CategoryRepository {
  async findAll(): Promise<Category[]> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data ?? []
  }

  async findBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error && error.code === 'PGRST116') return null
    if (error) throw error
    return data
  }

  async create(category: CategoryInsert): Promise<Category> {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert(category)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
