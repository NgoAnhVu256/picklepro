// ============================================
// Stripe Server-side Client
// Sử dụng cho tạo checkout sessions, webhook
// ============================================

import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('[Stripe] Thiếu biến môi trường: STRIPE_SECRET_KEY')
    }
    _stripe = new Stripe(secretKey, {
      apiVersion: '2025-03-31.basil' as any,
      typescript: true,
    })
  }
  return _stripe
}

// Lazy export — chỉ khởi tạo khi thực sự gọi
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop]
  },
})
