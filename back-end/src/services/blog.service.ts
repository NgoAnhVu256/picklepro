import { supabaseAdmin } from '../config/supabase'
import { ServiceError } from './product.service'

export class BlogService {
  /** Admin: Get all blogs with pagination */
  async getAdminBlogs(page = 1, limit = 20, search = '') {
    let query = supabaseAdmin
      .from('blogs')
      .select('*', { count: 'exact' })

    if (search) query = query.ilike('title', `%${search}%`)

    const from = (page - 1) * limit
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (error) throw error
    return { blogs: data ?? [], total: count ?? 0, page, limit }
  }

  /** Client: Get published blogs */
  async getPublishedBlogs(page = 1, limit = 20) {
    const from = (page - 1) * limit
    const { data, error, count } = await supabaseAdmin
      .from('blogs')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)

    if (error) throw error
    return { blogs: data ?? [], total: count ?? 0, page, limit }
  }

  /** Client: Get blog by slug */
  async getBlogBySlug(slug: string) {
    const { data, error } = await supabaseAdmin
      .from('blogs')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error) throw new ServiceError('NOT_FOUND', 'Không tìm thấy bài viết', 404)
    return data
  }

  /** Admin: Create blog */
  async createBlog(payload: any) {
    const slug = payload.slug || this.generateSlug(payload.title)
    const { data, error } = await supabaseAdmin
      .from('blogs')
      .insert({ ...payload, slug })
      .select()
      .single()

    if (error) throw new ServiceError('CREATE_FAILED', error.message)
    return data
  }

  /** Admin: Update blog */
  async updateBlog(id: string, payload: any) {
    if (payload.title && !payload.slug) {
      payload.slug = this.generateSlug(payload.title)
    }

    const { data, error } = await supabaseAdmin
      .from('blogs')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new ServiceError('UPDATE_FAILED', error.message)
    return data
  }

  /** Admin: Delete blog */
  async deleteBlog(id: string) {
    const { error } = await supabaseAdmin.from('blogs').delete().eq('id', id)
    if (error) throw new ServiceError('DELETE_FAILED', error.message)
    return { success: true }
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
}
