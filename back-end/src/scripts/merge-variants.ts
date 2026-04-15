import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '../front-end/.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

async function runMerge() {
  console.log('Fetching products...')
  const { data: products, error } = await supabaseAdmin.from('products').select('*')
  if (error) {
    console.error('Lỗi khi fetch products:', error)
    return
  }

  // Tách BaseName từ các sản phẩm cũ
  // Tên sản phẩm = "Balo Soxter Gen 3 – Đỏ" => Base = "Balo Soxter Gen 3"
  // Tên sản phẩm = "Giày Lotto Mirage 300 Nam - Size 44" => Base = "Giày Lotto Mirage 300 Nam"

  const groupMap = new Map<string, any[]>()

  for (const p of products) {
    // Thử tách bằng dấu gạch ngang (cách - cách)
    let baseName = p.name
    let variantSuffix = ''
    
    // Pattern: BaseName - Suffix
    const match = p.name.match(/^(.*?)\s*[-–]\s*(Màu [\w\s]+|Size [\w\d]+|[\w\s]+)$/i)
    if (match) {
      baseName = match[1].trim()
      variantSuffix = match[2].trim()
    } else {
      // Thử xem nếu có " - "
      const parts = p.name.split(/\s+[-–]\s+/)
      if (parts.length > 1) {
        variantSuffix = parts.pop().trim()
        baseName = parts.join(' - ').trim()
      }
    }

    if (!groupMap.has(baseName)) groupMap.set(baseName, [])
    groupMap.get(baseName)?.push({ ...p, variantSuffix })
  }

  const groupsToMerge = Array.from(groupMap.entries()).filter(([name, list]) => list.length > 1)
  
  console.log(`Tìm thấy ${groupsToMerge.length} nhóm sản phẩm có thể gộp.`)

  for (const [baseName, list] of groupsToMerge) {
    console.log(`\n========= QUÁ TRÌNH GỘP: ${baseName} (${list.length} variants) =========`)
    
    // Sort list để lấy sản phẩm đầu tiên làm Gốc
    list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    
    const rootProduct = list[0]
    const otherProducts = list.slice(1)
    
    console.log(`> ROOT: [${rootProduct.id}] ${rootProduct.name}`)

    const specs = rootProduct.specs ? (typeof rootProduct.specs === 'string' ? JSON.parse(rootProduct.specs) : rootProduct.specs) : {}
    const colors = new Set<string>(specs.colors || [])
    const sizes = new Set<string>(specs.sizes || [])

    // Lấy ảnh của chính thằng Root
    const { data: rootImages } = await supabaseAdmin.from('product_images').select('*').eq('product_id', rootProduct.id)
    
    let totalStock = rootProduct.stock || 0

    // Gom thông tin từ các biến thể
    for (const p of list) { // Bao gồm cả Root để lấy color/size
      if (p.variantSuffix.match(/size/i)) {
        const sMatch = p.variantSuffix.match(/size\s*([\w\d]+)/i)
        if (sMatch) sizes.add(sMatch[1])
        else sizes.add(p.variantSuffix)
      } else {
        const cMatch = p.variantSuffix.replace(/Màu\s*/i, '').trim()
        if (cMatch && cMatch.length > 0) colors.add(cMatch)
      }
    }

    for (const p of otherProducts) {
      console.log(`  - Gom: [${p.id}] ${p.name}`)
      totalStock += p.stock || 0
      
      // Chuyển ảnh sang Root Product (chỉ chuyển ảnh không bị trùng url)
      const { data: imgData } = await supabaseAdmin.from('product_images').select('*').eq('product_id', p.id)
      if (imgData && imgData.length > 0) {
        for (const img of imgData) {
          const isExist = (rootImages || []).find(r => r.url === img.url)
          if (!isExist) {
            await supabaseAdmin.from('product_images').update({ product_id: rootProduct.id, is_primary: false }).eq('id', img.id)
          } else {
            // Ảnh trùng, xóa đi
            await supabaseAdmin.from('product_images').delete().eq('id', img.id)
          }
        }
      }

      // Ẩn (Soft delete) biến thể
      await supabaseAdmin.from('products').update({ is_active: false }).eq('id', p.id)
    }

    // Cập nhật lại sản phẩm gốc (Đổi tên, tổng kho, specs variant)
    specs.colors = Array.from(colors)
    specs.sizes = Array.from(sizes)

    await supabaseAdmin.from('products').update({
      name: baseName, // Rút gọn tên gốc
      stock: totalStock,
      specs: specs
    }).eq('id', rootProduct.id)

    console.log(`> Xong gom: ${baseName}. Tổng kho mới: ${totalStock}. Colors: [${specs.colors}], Sizes: [${specs.sizes}]`)
  }
}

runMerge().then(() => console.log('HOÀN TẤT!')).catch(console.error)
