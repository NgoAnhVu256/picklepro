// ============================================
// Order DTOs
// ============================================

import type { Order, OrderWithItems, OrderStatus } from './database'
import type { PaginationMeta } from './product.dto'

// --- Request DTOs ---

export interface CartItem {
  productId: string
  quantity: number
  color?: string | null
  size?: string | null
}

export interface CreateOrderDTO {
  items: CartItem[]
  shippingName: string
  shippingAddress: string
  shippingPhone: string
  paymentMethod: 'stripe' | 'cod' | 'vnpay' | 'bank_transfer'
}

export interface UpdateOrderStatusDTO {
  orderId: string
  status: OrderStatus
}

// --- Response DTOs ---

export interface OrderListResponse {
  orders: OrderWithItems[]
  pagination: PaginationMeta
}

export interface CheckoutSessionResponse {
  checkoutUrl: string
  orderId: string
  sessionId: string
}
