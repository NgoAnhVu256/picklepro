// ============================================
// Chat Validators
// ============================================

import { z } from 'zod'

export const chatMessageSchema = z.object({
  message: z.string()
    .min(1, 'Tin nhắn không được để trống')
    .max(1000, 'Tin nhắn tối đa 1000 ký tự'),
  conversationId: z.string().uuid().optional(),
})
