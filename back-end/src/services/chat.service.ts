// ============================================
// Chat Service — Dùng Google Gemini (MIỄN PHÍ)
// RAG Pipeline: User question → Product search → Gemini
// ============================================

import { gemini } from '../config/gemini'
import { ProductRepository } from '../repositories/product.repository'
import { ChatRepository } from '../repositories/chat.repository'
import { chatMessageSchema } from '../validators/chat.validator'
import { ServiceError } from './product.service'
import type { ChatRequestDTO, ChatResponseDTO } from '../types/chat.dto'

const ZALO_LINK = process.env.ZALO_CHAT_LINK || 'https://zalo.me/0373164472'

const SYSTEM_PROMPT = `Bạn là trợ lý tư vấn thông minh của PicklePro - cửa hàng Pickleball hàng đầu Việt Nam.

NHIỆM VỤ:
- Tư vấn sản phẩm Pickleball dựa trên dữ liệu sản phẩm được cung cấp
- Giúp khách hàng lựa chọn vợt, phụ kiện phù hợp với nhu cầu

QUY TẮC:
1. CHỈ tư vấn sản phẩm có trong dữ liệu context được cung cấp
2. Trả lời bằng tiếng Việt, thân thiện và chuyên nghiệp
3. Đề xuất sản phẩm kèm: tên, giá, thương hiệu, đặc điểm nổi bật
4. Nếu không có sản phẩm phù hợp → thông báo rõ ràng
5. Không bịa đặt thông tin sản phẩm
6. Giữ câu trả lời ngắn gọn, dưới 300 từ

QUAN TRỌNG - KHI KHÁCH HÀNG ĐÃ CHỐT SẢN PHẨM:
Khi khách hàng bày tỏ ý muốn mua/chốt/đặt sản phẩm (ví dụ: "mua cái này", "chốt", "lấy cái này", "đặt hàng", "ok lấy", "mình mua"), hãy:
1. Xác nhận lại sản phẩm khách chọn
2. Gợi ý khách nhắn Zalo để được tư vấn thêm chi tiết, xác nhận đơn hàng, và được hỗ trợ nhanh nhất
3. Cung cấp link Zalo: ${ZALO_LINK}
4. Hoặc khách có thể thêm vào giỏ hàng và thanh toán trực tiếp trên website

Ví dụ câu trả lời khi khách chốt:
"Tuyệt vời! Bạn đã chọn [tên SP] - [giá]. Để được tư vấn thêm chi tiết và chốt đơn nhanh nhất, bạn có thể nhắn tin Zalo cho PicklePro tại: ${ZALO_LINK} 💬
Hoặc bạn có thể thêm vào giỏ hàng và thanh toán ngay trên website nhé!"
`

export class ChatService {
  private productRepo: ProductRepository
  private chatRepo: ChatRepository

  constructor() {
    this.productRepo = new ProductRepository()
    this.chatRepo = new ChatRepository()
  }

  /**
   * Xử lý tin nhắn chat với RAG + Gemini
   */
  async processMessage(userId: string, rawInput: unknown): Promise<ChatResponseDTO> {
    const input = chatMessageSchema.parse(rawInput) as ChatRequestDTO

    // 1. Trích xuất keywords từ câu hỏi
    const keywords = this.extractKeywords(input.message)

    // 2. Tìm sản phẩm liên quan trong DB
    const products = await this.productRepo.searchForRAG(keywords, 8)

    // 3. Tạo context từ dữ liệu sản phẩm
    const context = this.buildContext(products, input.message)

    // 4. Lấy lịch sử chat gần đây (chỉ cho user đã đăng nhập)
    let history: any[] = []
    const isGuest = userId === 'guest'
    if (!isGuest) {
      try {
        history = await this.chatRepo.findByUserId(userId, 10)
      } catch {
        // Bỏ qua lỗi nếu table chưa tồn tại
      }
    }

    // 5. Build conversation cho Gemini
    const MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite']

    // Tạo prompt tổng hợp
    let fullPrompt = `${SYSTEM_PROMPT}\n\nDỮ LIỆU SẢN PHẨM HIỆN CÓ:\n${context}\n\n`

    // Thêm lịch sử chat
    const recentHistory = history.slice(-6)
    if (recentHistory.length > 0) {
      fullPrompt += 'LỊCH SỬ CUỘC TRÒ CHUYỆN:\n'
      for (const msg of recentHistory) {
        fullPrompt += `${msg.role === 'user' ? 'Khách hàng' : 'Trợ lý'}: ${msg.content}\n`
      }
      fullPrompt += '\n'
    }

    fullPrompt += `Khách hàng: ${input.message}\nTrợ lý:`

    // Thử từng model, fallback nếu bị rate limit
    let reply = ''
    for (const modelName of MODELS) {
      try {
        const model = gemini.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(fullPrompt)
        reply = result.response.text() || ''
        if (reply) break // Thành công → thoát vòng lặp
      } catch (err: any) {
        const is429 = err?.message?.includes('429') || err?.message?.includes('quota')
        const is404 = err?.message?.includes('404') || err?.message?.includes('not found')
        if (is429 || is404) {
          console.warn(`[Chat] Model ${modelName} failed (${is429 ? '429 quota' : '404'}), trying next...`)
          continue // Thử model tiếp theo
        }
        throw err // Lỗi khác → throw
      }
    }

    if (!reply) {
      reply = 'Xin lỗi, hệ thống AI đang tạm quá tải. Vui lòng thử lại sau vài giây nhé! ⏳'
    }

    // 6. Lưu lịch sử chat (chỉ cho user đã đăng nhập)
    if (!isGuest) {
      try {
        await this.chatRepo.create({ user_id: userId, role: 'user', content: input.message })
        await this.chatRepo.create({ user_id: userId, role: 'assistant', content: reply })
      } catch {
        // Bỏ qua lỗi lưu lịch sử
      }
    }

    // 7. Trả về response kèm sản phẩm gợi ý
    return {
      reply,
      suggestedProducts: products.slice(0, 3).map((p) => ({
        id: (p as any).id || '',
        name: p.name,
        brand: p.brand,
        price: p.price,
        slug: p.slug,
      })),
    }
  }

  /**
   * Trích xuất keywords từ câu hỏi người dùng
   */
  private extractKeywords(message: string): string {
    // Loại bỏ stopwords tiếng Việt cơ bản
    const stopwords = [
      'tôi', 'bạn', 'cho', 'của', 'và', 'là', 'có', 'không',
      'được', 'với', 'này', 'đó', 'một', 'các', 'những',
      'muốn', 'cần', 'hỏi', 'xin', 'hãy', 'nên', 'thì',
      'mua', 'tìm', 'gợi', 'ý', 'tư', 'vấn', 'giúp',
    ]

    const words = message
      .toLowerCase()
      .replace(/[^\w\sàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 1 && !stopwords.includes(w))

    return words.join(' ') || message
  }

  /**
   * Build context string từ dữ liệu sản phẩm
   */
  private buildContext(products: any[], query: string): string {
    if (products.length === 0) {
      return 'Không tìm thấy sản phẩm phù hợp trong kho.'
    }

    return products.map((p, i) => {
      const specs = p.specs
        ? Object.entries(p.specs).map(([k, v]) => `  - ${k}: ${v}`).join('\n')
        : '  Chưa có thông số'

      return [
        `[${i + 1}] ${p.name}`,
        `  Thương hiệu: ${p.brand}`,
        `  Giá: ${new Intl.NumberFormat('vi-VN').format(p.price)} VND`,
        `  Đánh giá: ${p.rating}/5`,
        `  Mô tả: ${p.description || 'Chưa có mô tả'}`,
        `  Thông số:\n${specs}`,
      ].join('\n')
    }).join('\n\n')
  }
}
