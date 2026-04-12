// ============================================
// Chat API — AI Chatbot (Không cần đăng nhập)
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { ChatService } from '@picklepro/back-end'
import { createClient } from '@/lib/supabase/server'

const chatService = new ChatService()

export async function POST(request: NextRequest) {
  try {
    // Lấy user nếu đã đăng nhập (optional)
    let userId = 'guest'
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) userId = user.id
    } catch {
      // Không đăng nhập → dùng guest
    }

    const body = await request.json()
    const result = await chatService.processMessage(userId, body)
    return NextResponse.json(result)
  } catch (error: any) {
    const statusCode = error?.statusCode || 500
    console.error('[API /chat] Error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Lỗi server' }, { status: statusCode })
  }
}
