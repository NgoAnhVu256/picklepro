// ============================================
// OpenAI Client
// Sử dụng cho AI Chatbot (GPT-4o mini)
// ============================================

import OpenAI from 'openai'

let _openai: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('[OpenAI] Thiếu biến môi trường: OPENAI_API_KEY')
    }
    _openai = new OpenAI({ apiKey })
  }
  return _openai
}

// Lazy export — chỉ khởi tạo khi thực sự gọi
export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return (getOpenAI() as any)[prop]
  },
})
