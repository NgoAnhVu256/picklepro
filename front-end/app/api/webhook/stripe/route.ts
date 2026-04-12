// ============================================
// Stripe Webhook — Xử lý event thanh toán
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { CheckoutService } from '@picklepro/back-end'

const checkoutService = new CheckoutService()

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    await checkoutService.handleWebhook(payload, signature)
    return NextResponse.json({ received: true })
  } catch (error: any) {
    const statusCode = error?.statusCode || 500
    console.error('[Webhook] Error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Webhook error' }, { status: statusCode })
  }
}
