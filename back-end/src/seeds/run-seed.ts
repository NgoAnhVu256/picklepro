// ============================================
// Seed Runner
// Chạy: pnpm --filter back-end seed
// ============================================

import 'dotenv/config'
import { supabaseAdmin } from '../config/supabase'
import { categoriesSeed } from './categories.seed'
import { productsSeed } from './products.seed'

async function runSeed() {
  console.log('🌱 Bắt đầu seed dữ liệu...\n')

  try {
    // --- 1. Seed Categories ---
    console.log('📁 Đang tạo danh mục...')
    const { data: categories, error: catError } = await supabaseAdmin
      .from('categories')
      .upsert(categoriesSeed, { onConflict: 'slug' })
      .select()

    if (catError) throw catError
    console.log(`   ✅ Đã tạo ${categories?.length} danh mục\n`)

    // Tạo map slug → id
    const categoryMap = new Map<string, string>()
    categories?.forEach((cat) => categoryMap.set(cat.slug, cat.id))

    // --- 2. Seed Products ---
    console.log('📦 Đang tạo sản phẩm...')
    for (const product of productsSeed) {
      const categoryId = categoryMap.get(product.categorySlug)
      if (!categoryId) {
        console.log(`   ⚠️ Bỏ qua "${product.name}" - không tìm thấy danh mục "${product.categorySlug}"`)
        continue
      }

      const { error: prodError } = await supabaseAdmin
        .from('products')
        .upsert(
          {
            name: product.name,
            slug: product.slug,
            description: product.description,
            brand: product.brand,
            price: product.price,
            original_price: product.original_price,
            category_id: categoryId,
            stock: product.stock,
            tags: product.tags,
            specs: product.specs,
            is_featured: product.is_featured,
            is_active: true,
            rating: Math.round((4.5 + Math.random() * 0.5) * 10) / 10, // Random 4.5-5.0
            review_count: Math.floor(50 + Math.random() * 400),
          },
          { onConflict: 'slug' }
        )

      if (prodError) {
        console.log(`   ❌ Lỗi "${product.name}":`, prodError.message)
      } else {
        console.log(`   ✅ ${product.brand} - ${product.name}`)
      }
    }

    console.log(`\n🎉 Seed hoàn tất! Đã tạo ${productsSeed.length} sản phẩm.`)
  } catch (error) {
    console.error('\n❌ Seed thất bại:', error)
    process.exit(1)
  }
}

runSeed()
