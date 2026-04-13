import { NextRequest, NextResponse } from 'next/server'
import { AdminService, supabaseAdmin } from '@picklepro/back-end'
import { getAdminUser, adminUnauthorized } from '../../_helpers'

const adminService = new AdminService()

export async function POST(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  try {
    const { products } = await req.json()

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Danh sách sản phẩm trống' }, { status: 400 })
    }

    // Lấy tất cả categories để match theo tên
    const { data: categories } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug')

    const categoryMap = new Map<string, string>()
    for (const cat of categories ?? []) {
      categoryMap.set(cat.name.toLowerCase(), cat.id)
      categoryMap.set(cat.slug.toLowerCase(), cat.id)
    }

    const results: { success: number; failed: number; errors: string[] } = {
      success: 0,
      failed: 0,
      errors: [],
    }

    for (let i = 0; i < products.length; i++) {
      const row = products[i]
      try {
        // Match category
        let categoryId = row.category_id || ''
        if (!categoryId && row.category) {
          categoryId = categoryMap.get(row.category.toLowerCase()) || ''
        }

        // Generate slug
        const slug = (row.slug || row.name || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          + '-' + Date.now().toString(36) + i

        const productData: any = {
          name: row.name,
          slug,
          brand: row.brand || 'PicklePro',
          price: Number(row.price) || 0,
          original_price: row.original_price ? Number(row.original_price) : null,
          stock: Number(row.stock) || 0,
          description: row.description || null,
          category_id: categoryId || null,
          is_featured: row.is_featured === 'true' || row.is_featured === true,
          is_active: row.is_active !== 'false' && row.is_active !== false,
          tags: typeof row.tags === 'string' ? row.tags.split(';').map((t: string) => t.trim()).filter(Boolean) : (row.tags || []),
          rating: Number(row.rating) || 4.5,
          review_count: Number(row.review_count) || 0,
        }

        if (!productData.name || !productData.price) {
          results.errors.push(`Dòng ${i + 1}: Thiếu tên hoặc giá sản phẩm`)
          results.failed++
          continue
        }

        const { error } = await supabaseAdmin
          .from('products')
          .insert(productData)

        if (error) {
          results.errors.push(`Dòng ${i + 1} (${row.name}): ${error.message}`)
          results.failed++
        } else {
          results.success++
        }
      } catch (err: any) {
        results.errors.push(`Dòng ${i + 1}: ${err.message}`)
        results.failed++
      }
    }

    return NextResponse.json(results)
  } catch (e: any) {
    console.error('[Admin Import] Error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
