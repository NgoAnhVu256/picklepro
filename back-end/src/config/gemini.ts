// ============================================
// Google Gemini Client (MIỄN PHÍ)
// Thay thế OpenAI — Free tier: 15 RPM, 1M tokens/day
// Lấy key tại: https://aistudio.google.com/apikey
// ============================================

import { GoogleGenerativeAI } from '@google/generative-ai'

let _genAI: GoogleGenerativeAI | null = null

export function getGemini(): GoogleGenerativeAI {
  if (!_genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('[Gemini] Thiếu biến môi trường: GEMINI_API_KEY. Lấy miễn phí tại https://aistudio.google.com/apikey')
    }
    _genAI = new GoogleGenerativeAI(apiKey)
  }
  return _genAI
}

// Lazy export
export const gemini = new Proxy({} as GoogleGenerativeAI, {
  get(_target, prop) {
    return (getGemini() as any)[prop]
  },
})
