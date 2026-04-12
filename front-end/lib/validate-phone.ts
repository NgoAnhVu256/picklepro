// ============================================
// Shared phone number validation (Vietnam)
// Hỗ trợ: 0xxxxxxxxx hoặc +84xxxxxxxxx
// Các đầu số: 03x, 05x, 07x, 08x, 09x
// ============================================

export const PHONE_REGEX = /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[0-9]|9[0-9])[0-9]{7}$/

export function validatePhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s.-]/g, '')
  if (!cleaned) return 'Vui lòng nhập số điện thoại'
  if (!PHONE_REGEX.test(cleaned)) return 'Số điện thoại không hợp lệ (VD: 0912 345 678)'
  return null // OK
}

export function formatPhoneInput(value: string): string {
  // Chỉ giữ số và dấu + ở đầu
  return value.replace(/[^\d+]/g, '').slice(0, 12)
}

export function isPhoneValid(phone: string): boolean {
  return validatePhone(phone.replace(/[\s.-]/g, '')) === null
}
