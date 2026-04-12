// ============================================
// Auth Validators
// ============================================

import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string()
    .min(6, 'Mật khẩu tối thiểu 6 ký tự')
    .max(72, 'Mật khẩu tối đa 72 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu cần ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Mật khẩu cần ít nhất 1 chữ số'),
  fullName: z.string().min(2, 'Họ tên tối thiểu 2 ký tự').max(100),
  phone: z.string()
    .regex(
      /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[0-9]|9[0-9])[0-9]{7}$/,
      'Số điện thoại không hợp lệ (VD: 0912 345 678)'
    )
    .optional(),
})

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string()
    .regex(
      /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[0-9]|9[0-9])[0-9]{7}$/,
      'Số điện thoại không hợp lệ (VD: 0912 345 678)'
    )
    .optional(),
  address: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
})
