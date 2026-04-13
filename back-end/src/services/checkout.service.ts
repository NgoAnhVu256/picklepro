// ============================================
// Checkout Service
// Xử lý thanh toán: VNPay, MoMo QR, COD
// ============================================

import { createVNPayUrl } from '../config/vnpay'
import { OrderRepository } from '../repositories/order.repository'
import { ProductRepository } from '../repositories/product.repository'
import { OrderService } from './order.service'
import { ServiceError } from './product.service'
import type { CreateOrderDTO, CheckoutSessionResponse } from '../types/order.dto'

export class CheckoutService {
  private orderService: OrderService
  private orderRepo: OrderRepository
  private productRepo: ProductRepository

  constructor() {
    this.orderService = new OrderService()
    this.orderRepo = new OrderRepository()
    this.productRepo = new ProductRepository()
  }

  /**
   * Tạo phiên thanh toán VNPay
   */
  async createVNPaySession(
    userId: string,
    input: CreateOrderDTO,
    appUrl: string,
    ipAddr: string
  ): Promise<CheckoutSessionResponse> {
    // Tạo order trước
    const { order, totalAmount } = await this.orderService.createOrder(userId, input)

    // Tạo VNPay URL
    const paymentUrl = createVNPayUrl({
      orderId: order.id,
      amount: totalAmount,
      orderInfo: `PicklePro - Thanh toan don hang #${order.id.slice(0, 8)}`,
      ipAddr,
      appUrl,
    })

    return {
      checkoutUrl: paymentUrl,
      orderId: order.id,
      sessionId: `vnpay_${order.id}`,
    }
  }

  /**
   * Tạo đơn hàng MoMo (chuyển khoản QR)
   * Trả về thông tin chuyển khoản để hiển thị QR
   */
  async createBankTransferOrder(
    userId: string,
    input: CreateOrderDTO,
  ): Promise<{ orderId: string; totalAmount: number; bankInfo: any }> {
    const { order, totalAmount } = await this.orderService.createOrder(userId, input)

    return {
      orderId: order.id,
      totalAmount,
      bankInfo: {
        bankName: 'MBBANK',
        accountNumber: '2506200466666',
        accountHolder: 'NGO TRI ANH VU',
        content: `PP${order.id.slice(0, 8).toUpperCase()}`,
        qrUrl: `https://img.vietqr.io/image/mb-2506200466666-compact2.png?amount=${totalAmount}&addInfo=PP${order.id.slice(0, 8).toUpperCase()}&accountName=NGO%20TRI%20ANH%20VU`,
      },
    }
  }

  /**
   * Xử lý VNPay Return
   */
  async handleVNPayReturn(query: Record<string, string>): Promise<{ success: boolean; orderId: string }> {
    const { verifyVNPayReturn } = await import('../config/vnpay')
    const { isValid, responseCode, orderId } = verifyVNPayReturn(query)

    if (!isValid) {
      throw new ServiceError('INVALID_SIGNATURE', 'Chữ ký VNPay không hợp lệ', 400)
    }

    if (responseCode === '00') {
      // Thanh toán thành công
      if (orderId) {
        await this.orderRepo.updateStatus(orderId, 'paid')
      }
      return { success: true, orderId }
    }

    return { success: false, orderId }
  }
}
