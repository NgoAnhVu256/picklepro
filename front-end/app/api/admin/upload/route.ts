// ============================================
// Image Upload API — Supabase Storage
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@picklepro/back-end'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'product-images'

// Kiểm tra admin
async function isAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'admin' ? user : null
}

export async function POST(request: NextRequest) {
  try {
    const user = await isAdmin()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = (formData.get('folder') as string) || 'products'

    if (!file) {
      return NextResponse.json({ error: 'Chưa chọn file' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Chỉ hỗ trợ JPEG, PNG, WebP, AVIF' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File quá lớn (tối đa 5MB)' }, { status: 400 })
    }

    // Tạo tên file unique
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    // Create bucket if not exists recursively
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    if (!buckets?.some(b => b.name === BUCKET)) {
      await supabaseAdmin.storage.createBucket(BUCKET, { public: true })
    }

    // Upload lên Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        cacheControl: '31536000', // 1 year cache
        upsert: false,
      })

    if (error) {
      console.error('[Upload] Error:', error)
      return NextResponse.json({ error: 'Lỗi từ Supabase: ' + error.message }, { status: 400 })
    }

    // Lấy public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(data.path)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: data.path,
    })
  } catch (error: any) {
    console.error('[Upload] Error:', error)
    return NextResponse.json({ error: 'Lỗi upload' }, { status: 500 })
  }
}
