// ============================================
// Order Validators
// ============================================

import { z } from 'zod'

const cartItemSchema = z.object({
  productId: z.string().uuid('Product ID không hợp lệ'),
  quantity: z.number().min(1, 'Số lượng tối thiểu là 1').max(99, 'Số lượng tối đa là 99'),
  color: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
})

export const createOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'Giỏ hàng không được trống'),
  shippingName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
  shippingAddress: z.string().min(10, 'Địa chỉ tối thiểu 10 ký tự').max(500),
  shippingPhone: z.string()
    .regex(
      /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[0-9]|9[0-9])[0-9]{7}$/,
      'Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng Việt Nam (VD: 0912 345 678)'
    ),
  paymentMethod: z.enum(['stripe', 'cod', 'vnpay', 'bank_transfer'], {
    errorMap: () => ({ message: 'Phương thức thanh toán không hợp lệ' }),
  }),
})

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid('Order ID không hợp lệ'),
  status: z.enum(['pending', 'paid', 'shipping', 'completed', 'cancelled'], {
    errorMap: () => ({ message: 'Trạng thái đơn hàng không hợp lệ' }),
  }),
})
