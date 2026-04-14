// ============================================
// Image Upload API — Supabase Storage
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@picklepro/back-end'
import { createClient } from '@/lib/supabase/server'

const BUCKET = 'product-images'

// Track bucket init per serverless cold start
let bucketEnsured = false

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

// Ensure bucket exists — idempotent, only runs once per cold start
async function ensureBucket() {
  if (bucketEnsured) return

  try {
    const { error } = await supabaseAdmin.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    })

    // Ignore "already exists" — that's good!
    if (error && !error.message?.includes('already exists')) {
      console.warn('[Upload] Bucket create warning:', error.message)
    }
  } catch (e: any) {
    console.warn('[Upload] ensureBucket exception:', e.message)
  }

  bucketEnsured = true
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

    // Ensure bucket exists before upload
    await ensureBucket()

    // Tạo tên file unique
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer()

    // Upload lên Supabase Storage
    let uploadData = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      })

    // If bucket not found, force re-create and retry once
    if (uploadData.error?.message?.includes('not found')) {
      console.warn('[Upload] Bucket not found, retrying creation...')
      bucketEnsured = false
      await ensureBucket()

      uploadData = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(fileName, arrayBuffer, {
          contentType: file.type,
          cacheControl: '31536000',
          upsert: false,
        })
    }

    if (uploadData.error) {
      console.error('[Upload] Final error:', uploadData.error)
      return NextResponse.json({
        error: `Upload thất bại: ${uploadData.error.message}. Nếu lỗi "Bucket not found", hãy vào Supabase Dashboard → Storage → New Bucket → tên "${BUCKET}" → chọn Public → Create.`
      }, { status: 400 })
    }

    // Lấy public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(uploadData.data.path)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: uploadData.data.path,
    })
  } catch (error: any) {
    console.error('[Upload] Unhandled:', error)
    return NextResponse.json({ error: 'Lỗi server: ' + (error.message || 'Unknown') }, { status: 500 })
  }
}
