// ============================================
// Zalo OA Service — AI Auto-Reply
// Nhận tin nhắn từ Zalo OA Webhook → Gemini AI → Trả lời
// ============================================

import { gemini } from '../config/gemini'
import { ProductRepository } from '../repositories/product.repository'

const ZALO_OA_ACCESS_TOKEN = process.env.ZALO_OA_ACCESS_TOKEN || ''
const ZALO_OA_SECRET = process.env.ZALO_OA_SECRET || ''
const ZALO_LINK = process.env.ZALO_CHAT_LINK || 'https://zalo.me/0373164472'

const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn AI của PicklePro - cửa hàng Pickleball hàng đầu Việt Nam. Khách hàng đang nhắn tin qua Zalo.

NHIỆM VỤ:
- Tư vấn sản phẩm Pickleball dựa trên dữ liệu sản phẩm được cung cấp
- Giúp khách hàng lựa chọn vợt, phụ kiện phù hợp với nhu cầu

QUY TẮC:
1. CHỈ tư vấn sản phẩm có trong dữ liệu context
2. Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
3. Đề xuất sản phẩm kèm: tên, giá, thương hiệu
4. Nếu không có sản phẩm phù hợp → thông báo rõ ràng
5. Không bịa đặt thông tin
6. Giữ câu trả lời ngắn gọn, dưới 200 từ (vì Zalo tin nhắn ngắn)
7. KHÔNG dùng markdown formatting (**, ##), vì Zalo không hiển thị được. Dùng emoji thay thế
8. Dùng emoji phù hợp (🏓⚡💰✅) để làm tin nhắn sinh động

KHI KHÁCH MUỐN MUA:
- Xác nhận sản phẩm
- Mời khách xem chi tiết và đặt hàng tại website: ${process.env.NEXT_PUBLIC_APP_URL || 'https://picklepro.vn'}
- Hoặc nhắn "ĐẶT HÀNG" để nhân viên hỗ trợ trực tiếp

KHI KHÁCH CHÀO HỎI/HỎI CHUNG:
- Chào hỏi thân thiện, giới thiệu PicklePro
- Hỏi khách cần tư vấn gì về Pickleball
`

// Bộ nhớ hội thoại đơn giản (in-memory, reset khi server restart)
const conversationHistory = new Map<string, { role: string; content: string; time: number }[]>()
const MAX_HISTORY = 10
const HISTORY_TTL = 30 * 60 * 1000 // 30 phút

export class ZaloOAService {
  private productRepo: ProductRepository

  constructor() {
    this.productRepo = new ProductRepository()
  }

  /**
   * Xác thực Webhook từ Zalo
   * Zalo gửi GET request với OA secret key để verify
   */
  verifyWebhook(token: string): boolean {
    return token === ZALO_OA_SECRET
  }

  /**
   * Xử lý tin nhắn nhận được từ Zalo OA
   */
  async handleIncomingMessage(senderId: string, messageText: string): Promise<string> {
    try {
      // 1. Lấy/tạo lịch sử hội thoại
      this.cleanExpiredHistory(senderId)
      const history = conversationHistory.get(senderId) || []

      // 2. Tìm sản phẩm liên quan
      const keywords = this.extractKeywords(messageText)
      const products = await this.productRepo.searchForRAG(keywords, 6)
      const context = this.buildProductContext(products)

      // 3. Build prompt cho Gemini
      let fullPrompt = `${SYSTEM_PROMPT}\n\nDỮ LIỆU SẢN PHẨM:\n${context}\n\n`

      // Thêm lịch sử chat gần nhất
      if (history.length > 0) {
        fullPrompt += 'LỊCH SỬ TRÒ CHUYỆN:\n'
        for (const msg of history.slice(-6)) {
          fullPrompt += `${msg.role === 'user' ? 'Khách' : 'Bot'}: ${msg.content}\n`
        }
        fullPrompt += '\n'
      }

      fullPrompt += `Khách: ${messageText}\nBot:`

      // 4. Gọi Gemini AI
      const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.5-flash-lite']
      let reply = ''

      for (const modelName of MODELS) {
        try {
          const model = gemini.getGenerativeModel({ model: modelName })
          const result = await model.generateContent(fullPrompt)
          reply = result.response.text() || ''
          if (reply) break
        } catch (err: any) {
          const isRetryable = err?.message?.includes('429') || err?.message?.includes('404') || err?.message?.includes('quota')
          if (isRetryable) {
            console.warn(`[ZaloOA] Model ${modelName} failed, trying next...`)
            continue
          }
          throw err
        }
      }

      if (!reply) {
        reply = 'Xin lỗi bạn, hệ thống AI đang bận. Nhân viên PicklePro sẽ trả lời bạn sớm nhất! 🙏'
      }

      // 5. Lưu lịch sử
      history.push({ role: 'user', content: messageText, time: Date.now() })
      history.push({ role: 'assistant', content: reply, time: Date.now() })
      if (history.length > MAX_HISTORY * 2) {
        history.splice(0, history.length - MAX_HISTORY * 2)
      }
      conversationHistory.set(senderId, history)

      return reply
    } catch (error) {
      console.error('[ZaloOA] Error processing message:', error)
      return 'Cảm ơn bạn đã nhắn tin! Nhân viên PicklePro sẽ phản hồi sớm nhất có thể 🏓'
    }
  }

  /**
   * Gửi tin nhắn trả lời qua Zalo OA API
   */
  async sendReply(userId: string, message: string): Promise<boolean> {
    if (!ZALO_OA_ACCESS_TOKEN) {
      console.warn('[ZaloOA] Chưa cấu hình ZALO_OA_ACCESS_TOKEN — không thể gửi tin nhắn')
      return false
    }

    try {
      const response = await fetch('https://openapi.zalo.me/v3.0/oa/message/cs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'access_token': ZALO_OA_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          recipient: { user_id: userId },
          message: { text: message },
        }),
      })

      const data = await response.json()

      if (data.error !== 0) {
        console.error('[ZaloOA] Send failed:', data)
        return false
      }

      console.log(`[ZaloOA] ✅ Replied to ${userId}`)
      return true
    } catch (error) {
      console.error('[ZaloOA] Send error:', error)
      return false
    }
  }

  /**
   * Xử lý toàn bộ flow: Nhận tin → AI → Trả lời
   */
  async processAndReply(senderId: string, messageText: string): Promise<void> {
    const reply = await this.handleIncomingMessage(senderId, messageText)
    await this.sendReply(senderId, reply)
  }

  // ---- Private helpers ----

  private extractKeywords(message: string): string {
    const stopwords = [
      'tôi', 'bạn', 'cho', 'của', 'và', 'là', 'có', 'không',
      'được', 'với', 'này', 'đó', 'một', 'các', 'những',
      'muốn', 'cần', 'hỏi', 'xin', 'hãy', 'nên', 'thì',
      'mua', 'tìm', 'gợi', 'ý', 'tư', 'vấn', 'giúp',
      'ơi', 'nhé', 'nha', 'ạ', 'ah', 'ừ', 'ok',
    ]

    const words = message
      .toLowerCase()
      .replace(/[^\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !stopwords.includes(w))

    return words.join(' ') || message
  }

  private buildProductContext(products: any[]): string {
    if (products.length === 0) {
      return 'Không tìm thấy sản phẩm phù hợp trong kho.'
    }

    return products.map((p, i) => {
      const price = new Intl.NumberFormat('vi-VN').format(p.price)
      const originalPrice = p.original_price ? new Intl.NumberFormat('vi-VN').format(p.original_price) : null
      const discount = p.original_price ? Math.round((1 - p.price / p.original_price) * 100) : 0

      let line = `[${i + 1}] ${p.name} | ${p.brand} | ${price}đ`
      if (discount > 0 && originalPrice) {
        line += ` (gốc ${originalPrice}đ, giảm ${discount}%)`
      }
      if (p.stock !== undefined) {
        line += ` | Còn ${p.stock} sản phẩm`
      }
      if (p.description) {
        line += `\n    Mô tả: ${p.description.substring(0, 120)}`
      }
      return line
    }).join('\n')
  }

  private cleanExpiredHistory(senderId: string): void {
    const history = conversationHistory.get(senderId)
    if (!history) return
    const now = Date.now()
    const valid = history.filter(h => now - h.time < HISTORY_TTL)
    if (valid.length === 0) {
      conversationHistory.delete(senderId)
    } else {
      conversationHistory.set(senderId, valid)
    }
  }
}
