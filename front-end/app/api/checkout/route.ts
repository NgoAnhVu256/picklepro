// ============================================
// Checkout API — VNPay + Bank Transfer
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { CheckoutService } from '@picklepro/back-end'
import { createClient } from '@/lib/supabase/server'

const checkoutService = new CheckoutService()

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    const body = await request.json()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const ipAddr = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'

    if (body.paymentMethod === 'vnpay') {
      // VNPay — redirect tới cổng thanh toán
      const result = await checkoutService.createVNPaySession(user.id, body, appUrl, ipAddr)
      return NextResponse.json(result)
    } else if (body.paymentMethod === 'bank_transfer') {
      // Chuyển khoản ngân hàng — trả về QR code
      const result = await checkoutService.createBankTransferOrder(user.id, body)
      return NextResponse.json(result)
    } else {
      return NextResponse.json({ error: 'Phương thức thanh toán không hợp lệ' }, { status: 400 })
    }
  } catch (error: any) {
    const statusCode = error?.statusCode || 500
    console.error('[API /checkout] Error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Lỗi server' }, { status: statusCode })
  }
}
