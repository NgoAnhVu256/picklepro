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
        const categoryField = (row.category || row.category_name || '').toLowerCase().trim()
        
        if (!categoryId && categoryField) {
          // 1. Exact match
          categoryId = categoryMap.get(categoryField) || ''
          
          // 2. Fuzzy match
          if (!categoryId) {
            for (const cat of categories ?? []) {
              const dbCatName = cat.name.toLowerCase()
              // If CSV says "vợt" and DB has "vợt pickleball", or vice versa
              if (dbCatName.includes(categoryField) || categoryField.includes(dbCatName)) {
                categoryId = cat.id
                break
              }
            }
          }
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

        // Parse tags — handle PostgreSQL array format {tag1, tag2} and semicolons
        let parsedTags: string[] = []
        if (typeof row.tags === 'string' && row.tags) {
          let tagStr = row.tags
          if (tagStr.startsWith('{') && tagStr.endsWith('}')) {
            tagStr = tagStr.slice(1, -1)
          }
          parsedTags = tagStr.split(/[;,]/).map((t: string) => t.trim()).filter(Boolean)
        } else if (Array.isArray(row.tags)) {
          parsedTags = row.tags
        }

        // Parse specs
        let parsedSpecs: any = null
        if (row.specs) {
          let specStr = typeof row.specs === 'string' ? row.specs : ''
          if (specStr.startsWith('{') && specStr.endsWith('}') && !specStr.startsWith('{"')) {
            specStr = '' // empty PostgreSQL array {}
          }
          if (specStr) {
            try { parsedSpecs = JSON.parse(specStr) } catch { parsedSpecs = null }
          }
        }

        const productData: any = {
          name: row.name,
          slug,
          brand: row.brand || 'PicklePro',
          price: Number(row.price) || 0,
          original_price: row.original_price ? Number(row.original_price) : null,
          stock: Number(row.stock) || 0,
          description: row.description || null,
          category_id: categoryId || null,
          is_featured: row.is_featured === 'true' || row.is_featured === 'True' || row.is_featured === true,
          is_active: row.is_active === 'true' || row.is_active === 'True' || row.is_active === true || row.is_active === '',
          tags: parsedTags,
          specs: parsedSpecs,
        }

        let imagesToInsert: string[] = []

        // Handle images: image_url may contain multiple comma-separated or semicolon-separated URLs
        if (row.image_url) {
          const urlStr = row.image_url.trim()
          // Split by semicolons first, then by comma+space+http pattern
          const urls = urlStr.includes(';') 
            ? urlStr.split(';').map((u: string) => u.trim()).filter(Boolean)
            : urlStr.split(/,\s*(?=http)/).map((u: string) => u.trim()).filter(Boolean)
          imagesToInsert.push(...urls)
        }
        if (row.images) {
          const imgs = typeof row.images === 'string'
            ? row.images.split(/[;,]\s*/).map((u: string) => u.trim()).filter(Boolean)
            : row.images
          imagesToInsert = [...imagesToInsert, ...imgs]
        }

        if (!productData.name || !productData.price) {
          results.errors.push(`Dòng ${i + 1}: Thiếu tên hoặc giá sản phẩm`)
          results.failed++
          continue
        }

        const { data: newProduct, error } = await supabaseAdmin
          .from('products')
          .insert(productData)
          .select()
          .single()

        if (error) {
          results.errors.push(`Dòng ${i + 1} (${row.name}): ${error.message}`)
          results.failed++
        } else {
          // Xử lý chèn hình ảnh nếu có
          if (imagesToInsert.length > 0 && newProduct) {
            const imageObjects = imagesToInsert.map((url, idx) => ({
              product_id: newProduct.id,
              url,
              is_primary: idx === 0,
            }))
            
            await supabaseAdmin.from('product_images').insert(imageObjects)
          }

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
