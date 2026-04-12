// ============================================
// @picklepro/back-end
// Clean Architecture Backend Package
// ============================================

// --- Config ---
export { supabaseAdmin } from './config/supabase'
export { gemini } from './config/gemini'
export { createVNPayUrl, verifyVNPayReturn } from './config/vnpay'

// --- Types & DTOs ---
export type * from './types/database'
export type * from './types/product.dto'
export type * from './types/order.dto'
export type * from './types/auth.dto'
export type * from './types/chat.dto'

// --- Validators ---
export {
  productFilterSchema,
  createProductSchema,
  updateProductSchema,
} from './validators/product.validator'
export {
  createOrderSchema,
  updateOrderStatusSchema,
} from './validators/order.validator'
export {
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from './validators/auth.validator'
export { chatMessageSchema } from './validators/chat.validator'

// --- Services ---
export { ProductService, ServiceError } from './services/product.service'
export { OrderService } from './services/order.service'
export { CheckoutService } from './services/checkout.service'
export { AuthService } from './services/auth.service'
export { ChatService } from './services/chat.service'
export { AdminService } from './services/admin.service'
export { sendOrderTelegramNotification } from './services/telegram.service'
