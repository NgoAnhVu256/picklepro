import { NextResponse } from 'next/server'
import { ProductService } from '@picklepro/back-end'

const productService = new ProductService()

export async function GET() {
  try {
    const categories = await productService.getCategories()
    return NextResponse.json({ categories })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Loi server' }, { status: 500 })
  }
}
