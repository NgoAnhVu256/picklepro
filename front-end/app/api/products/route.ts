// ============================================
// Products API — Thin Controller
// Mọi logic nằm ở ProductService (back-end)
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@picklepro/back-end'

const productService = new ProductService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    // Chi tiết sản phẩm theo slug
    if (slug) {
      const result = await productService.getProductBySlug(slug)
      return NextResponse.json(result)
    }

    // Danh sách sản phẩm có filter
    const filter = Object.fromEntries(searchParams.entries())
    const result = await productService.getProducts(filter)
    return NextResponse.json(result)
  } catch (error: any) {
    const statusCode = error?.statusCode || 500
    const message = error?.message || 'Lỗi server'
    const code = error?.code || 'INTERNAL_ERROR'

    console.error('[API /products] Error:', message)
    return NextResponse.json({ error: message, code }, { status: statusCode })
  }
}
