import { NextRequest, NextResponse } from 'next/server'
import { OrderService, sendOrderTelegramNotification } from '@picklepro/back-end'
import { createClient } from '@/lib/supabase/server'

const orderService = new OrderService()

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    const result = await orderService.getUserOrders(user.id)
    return NextResponse.json(result)
  } catch (error: any) {
    const statusCode = error?.statusCode || 500
    console.error('[API /orders] Error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Lỗi server' }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })
    }

    const body = await request.json()
    const result = await orderService.createOrder(user.id, body)

    // Gửi thông báo Telegram (không chặn response)
    sendOrderTelegramNotification({
      orderId: result.order.id,
      shippingName: body.shippingName,
      shippingPhone: body.shippingPhone,
      shippingAddress: body.shippingAddress,
      paymentMethod: body.paymentMethod,
      totalAmount: result.totalAmount,
      items: result.orderItemDetails || [],
    }).catch(err => console.error('[Telegram] Error:', err))

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    const statusCode = error?.statusCode || 500
    console.error('[API /orders] Error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Lỗi server' }, { status: statusCode })
  }
}
