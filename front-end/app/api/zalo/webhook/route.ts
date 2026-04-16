// ============================================
// Zalo OA Webhook — Nhận tin nhắn & Auto-Reply bằng AI
// Endpoint: /api/zalo/webhook
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { ZaloOAService } from '@picklepro/back-end'

const zaloService = new ZaloOAService()

/**
 * GET — Zalo dùng để verify webhook URL
 * Zalo sẽ gửi kèm query param để xác thực
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Zalo webhook verification
  // Trả về bất kỳ challenge token nào Zalo gửi
  const challenge = searchParams.get('challenge')
  if (challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  return NextResponse.json({ status: 'Zalo OA Webhook is active ✅' })
}

/**
 * POST — Nhận sự kiện (event) từ Zalo OA
 * Zalo gửi JSON payload khi có tin nhắn mới từ khách hàng
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('[ZaloWebhook] Received event:', JSON.stringify(body).substring(0, 500))

    const eventName = body.event_name

    // Chỉ xử lý tin nhắn text từ người dùng
    if (eventName === 'user_send_text') {
      const senderId = body.sender?.id
      const messageText = body.message?.text

      if (!senderId || !messageText) {
        console.warn('[ZaloWebhook] Missing sender.id or message.text')
        return NextResponse.json({ status: 'ignored' })
      }

      console.log(`[ZaloWebhook] 💬 Message from ${senderId}: "${messageText}"`)

      // Xử lý async — trả response ngay cho Zalo (tránh timeout)
      // Zalo yêu cầu response trong 5s
      zaloService.processAndReply(senderId, messageText).catch(err => {
        console.error('[ZaloWebhook] processAndReply error:', err)
      })

      return NextResponse.json({ status: 'processing' })
    }

    // Xử lý tin nhắn hình ảnh
    if (eventName === 'user_send_image') {
      const senderId = body.sender?.id
      if (senderId) {
        zaloService.sendReply(
          senderId,
          'Cảm ơn bạn đã gửi hình! 📸 Hiện tại bot chỉ hỗ trợ tin nhắn văn bản. Bạn hãy mô tả sản phẩm bạn cần tư vấn bằng chữ nhé! 🏓'
        ).catch(() => {})
      }
      return NextResponse.json({ status: 'image_noted' })
    }

    // Các event khác (user_send_sticker, follow, unfollow, etc.)
    console.log(`[ZaloWebhook] Unhandled event: ${eventName}`)

    // Event follow — Chào mừng user mới
    if (eventName === 'follow') {
      const followerId = body.follower?.id
      if (followerId) {
        zaloService.sendReply(
          followerId,
          '🏓 Chào mừng bạn đến với PicklePro!\n\nCảm ơn bạn đã quan tâm đến cửa hàng Pickleball của chúng tôi! 🎉\n\nBạn có thể nhắn tin hỏi bất cứ điều gì về:\n🏓 Vợt Pickleball\n👟 Giày thể thao\n🎒 Balo - Túi xách\n👕 Quần áo\n\nBot AI sẽ tư vấn cho bạn ngay lập tức! 💬'
        ).catch(() => {})
      }
      return NextResponse.json({ status: 'welcome_sent' })
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('[ZaloWebhook] Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
