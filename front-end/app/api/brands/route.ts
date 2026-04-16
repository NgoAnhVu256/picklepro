import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('products')
      .select('brand')
      .eq('is_active', true)

    if (error) throw error

    const brands = Array.from(new Set(data.filter(p => !!p.brand).map(p => p.brand.trim())))
    
    return NextResponse.json({ brands: brands.sort() })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
