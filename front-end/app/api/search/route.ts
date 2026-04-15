import { NextRequest, NextResponse } from 'next/server'
import { ProductService } from '@picklepro/back-end'

const productService = new ProductService()

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('q')?.trim() || ''
    
    if (!q || q.length < 2) {
      return NextResponse.json({ products: [] })
    }

    // Search products with limit for suggestions
    const result = await productService.getProducts({ search: q, limit: '6' })
    
    // Return lightweight suggestion data
    const products = (result.products || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      original_price: p.original_price,
      brand: p.brand,
      image: p.product_images?.find((i: any) => i.is_primary)?.url 
        || p.product_images?.[0]?.url 
        || null,
      category: p.categories?.name || '',
    }))

    return NextResponse.json({ products })
  } catch (error: any) {
    console.error('[API /search] Error:', error.message)
    return NextResponse.json({ products: [] })
  }
}
