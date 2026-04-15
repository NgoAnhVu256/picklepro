import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser, adminUnauthorized } from '../../_helpers'
import { notifyAdminRealtime } from '../../_realtime'

export async function POST(req: NextRequest) {
  const user = await getAdminUser()
  if (!user) return adminUnauthorized()

  try {
    const { items } = await req.json() // Array of { id, order } or just an array of IDs in order
    const supabase = await createClient()
    
    // items: string[] of category IDs in the new order
    // We will update their sort_order if the column exists, otherwise fallback to creating a small difference in created_at.
    
    // First, let's try updating sort_order. If it fails, we fall back to updating created_at.
    // Actually, just looping is easier
    let hasError = null
    for (let i = 0; i < items.length; i++) {
      const id = items[i]
      // Assume sort_order column might not exist. If it doesn't, this will error.
      const { error } = await supabase.from('categories').update({ sort_order: i }).eq('id', id)
      
      if (error && error.message.includes('sort_order')) {
          // Fallback: update created_at to reorder them
          // We assign descending created_at so that item 0 has highest created_at
          const newDate = new Date(Date.now() - i * 1000).toISOString()
          await supabase.from('categories').update({ created_at: newDate }).eq('id', id)
      } else if (error) {
          hasError = error
      }
    }

    if (hasError) throw hasError

    await notifyAdminRealtime({ scope: 'categories', action: 'reordered' })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 })
  }
}
