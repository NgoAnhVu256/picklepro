// ============================================
// VNPay Return — Verify payment result
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { CheckoutService } from '@picklepro/back-end'

const checkoutService = new CheckoutService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query: Record<string, string> = {}
    searchParams.forEach((value, key) => { query[key] = value })

    const result = await checkoutService.handleVNPayReturn(query)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[VNPay Return] Error:', error?.message)
    return NextResponse.json({ success: false, error: error?.message }, { status: 400 })
  }
}
