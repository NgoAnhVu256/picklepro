// ============================================
// Telegram Notification Service
// Gửi thông báo đơn hàng mới về Telegram
// ============================================

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

function formatVND(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

interface OrderNotification {
  orderId: string
  shippingName: string
  shippingPhone: string
  shippingAddress: string
  paymentMethod: string
  totalAmount: number
  items: { name: string; quantity: number; price: number }[]
}

export async function sendOrderTelegramNotification(order: OrderNotification) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('[Telegram] Bot token hoặc chat ID chưa cấu hình, bỏ qua thông báo')
    return
  }

  const paymentLabel: Record<string, string> = {
    cod: '💵 COD (Thanh toán khi nhận)',
    vnpay: '💳 VNPay',
    bank_transfer: '🏦 Chuyển khoản ngân hàng',
    stripe: '💳 Thẻ quốc tế',
  }

  const itemLines = order.items
    .map((item, i) => `  ${i + 1}. ${item.name} × ${item.quantity} — ${formatVND(item.price * item.quantity)}`)
    .join('\n')

  const message = `
🛒 *ĐƠN HÀNG MỚI — PicklePro*

📋 *Mã đơn:* \`${order.orderId.slice(0, 8)}\`
👤 *Khách hàng:* ${order.shippingName}
📱 *SĐT:* ${order.shippingPhone}
📍 *Địa chỉ:* ${order.shippingAddress}
💳 *Thanh toán:* ${paymentLabel[order.paymentMethod] || order.paymentMethod}

📦 *Sản phẩm:*
${itemLines}

💰 *Tổng cộng:* *${formatVND(order.totalAmount)}*

⏰ ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}
`.trim()

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[Telegram] Gửi thất bại:', err)
    } else {
      console.log('[Telegram] ✅ Đã gửi thông báo đơn hàng', order.orderId.slice(0, 8))
    }
  } catch (err) {
    console.error('[Telegram] Lỗi gửi thông báo:', err)
  }
}
