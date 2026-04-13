// ============================================
// Order Service
// Business logic cho đơn hàng
// ============================================

import { OrderRepository } from '../repositories/order.repository'
import { ProductRepository } from '../repositories/product.repository'
import { createOrderSchema } from '../validators/order.validator'
import { ServiceError } from './product.service'
import type { CreateOrderDTO } from '../types/order.dto'
import type { OrderInsert, OrderItemInsert } from '../types/database'

export class OrderService {
  private orderRepo: OrderRepository
  private productRepo: ProductRepository

  constructor() {
    this.orderRepo = new OrderRepository()
    this.productRepo = new ProductRepository()
  }

  /**
   * Tạo đơn hàng mới
   * 1. Validate input
   * 2. Kiểm tra tồn kho
   * 3. Tính tổng tiền từ giá DB (không tin client)
   * 4. Tạo order + items
   */
  async createOrder(userId: string, rawInput: unknown) {
    const input = createOrderSchema.parse(rawInput) as CreateOrderDTO

    // Lấy thông tin sản phẩm từ DB
    const productIds = input.items.map((item) => item.productId)
    const products = await this.productRepo.findByIds(productIds)

    // Kiểm tra tất cả sản phẩm tồn tại
    if (products.length !== productIds.length) {
      throw new ServiceError(
        'PRODUCT_NOT_FOUND',
        'Một hoặc nhiều sản phẩm không tồn tại',
        400
      )
    }

    // Kiểm tra tồn kho & tính tổng
    let totalAmount = 0
    const orderItems: Omit<OrderItemInsert, 'order_id'>[] = []

    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId)!

      if (product.stock < item.quantity) {
        throw new ServiceError(
          'OUT_OF_STOCK',
          `Sản phẩm "${product.name}" chỉ còn ${product.stock} trong kho`,
          400
        )
      }

      totalAmount += product.price * item.quantity
      orderItems.push({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: product.price,
      })
    }

    const shippingFee = totalAmount >= 500000 ? 0 : 30000
    totalAmount += shippingFee

    // Tạo order
    const orderInsert: OrderInsert = {
      user_id: userId,
      total_amount: totalAmount,
      shipping_name: input.shippingName,
      shipping_address: input.shippingAddress,
      shipping_phone: input.shippingPhone,
      payment_method: input.paymentMethod,
      stripe_session_id: null,
    }

    const order = await this.orderRepo.createWithItems(orderInsert, orderItems)

    return {
      order,
      totalAmount,
      // Thêm thông tin sản phẩm cho Telegram notification
      orderItemDetails: orderItems.map(oi => {
        const p = products.find(p => p.id === oi.product_id)!
        return { name: p.name, quantity: oi.quantity, price: oi.unit_price }
      }),
    }
  }

  /**
   * Lấy danh sách đơn hàng của user
   */
  async getUserOrders(userId: string, page = 1, limit = 10) {
    const { data, total } = await this.orderRepo.findByUserId(userId, page, limit)
    return {
      orders: data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Lấy chi tiết đơn hàng (verify ownership)
   */
  async getOrderById(userId: string, orderId: string) {
    const order = await this.orderRepo.findById(orderId)

    if (!order) {
      throw new ServiceError('ORDER_NOT_FOUND', 'Không tìm thấy đơn hàng', 404)
    }

    if (order.user_id !== userId) {
      throw new ServiceError('FORBIDDEN', 'Bạn không có quyền xem đơn hàng này', 403)
    }

    return order
  }
}
