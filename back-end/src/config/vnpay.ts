// ============================================
// VNPay Configuration
// Thanh toán nội địa Việt Nam
// Sandbox test miễn phí
// ============================================

import crypto from 'crypto'

export interface VNPayConfig {
  vnp_TmnCode: string
  vnp_HashSecret: string
  vnp_Url: string
  vnp_ReturnUrl: string
}

export function getVNPayConfig(appUrl: string): VNPayConfig {
  return {
    vnp_TmnCode: process.env.VNPAY_TMN_CODE || 'CGXZLS0Z',
    vnp_HashSecret: process.env.VNPAY_HASH_SECRET || 'SCZQFGROUPVQHTYVFVBITNMXCEXJKPC',
    vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    vnp_ReturnUrl: `${appUrl}/checkout/vnpay-return`,
  }
}

/**
 * Tạo URL thanh toán VNPay
 */
export function createVNPayUrl(params: {
  orderId: string
  amount: number // VND
  orderInfo: string
  ipAddr: string
  appUrl: string
}): string {
  const config = getVNPayConfig(params.appUrl)
  const date = new Date()

  // Format: yyyyMMddHHmmss
  const createDate = date.getFullYear().toString() +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0') +
    String(date.getHours()).padStart(2, '0') +
    String(date.getMinutes()).padStart(2, '0') +
    String(date.getSeconds()).padStart(2, '0')

  const vnp_Params: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: config.vnp_TmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: params.orderId.slice(0, 8) + '_' + Date.now(),
    vnp_OrderInfo: params.orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: String(params.amount * 100), // VNPay yêu cầu nhân 100
    vnp_ReturnUrl: config.vnp_ReturnUrl,
    vnp_IpAddr: params.ipAddr || '127.0.0.1',
    vnp_CreateDate: createDate,
  }

  // Sort params theo alphabet
  const sortedParams = Object.keys(vnp_Params).sort().reduce((acc, key) => {
    acc[key] = vnp_Params[key]
    return acc
  }, {} as Record<string, string>)

  // Tạo query string
  const signData = new URLSearchParams(sortedParams).toString()

  // Tạo HMAC SHA512
  const hmac = crypto.createHmac('sha512', config.vnp_HashSecret)
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

  return `${config.vnp_Url}?${signData}&vnp_SecureHash=${signed}`
}

/**
 * Verify VNPay return/IPN signature
 */
export function verifyVNPayReturn(query: Record<string, string>): {
  isValid: boolean
  responseCode: string
  orderId: string
} {
  const config = getVNPayConfig('')
  const vnp_SecureHash = query.vnp_SecureHash

  // Remove hash fields
  const params = { ...query }
  delete params.vnp_SecureHash
  delete params.vnp_SecureHashType

  // Sort and sign
  const sortedParams = Object.keys(params).sort().reduce((acc, key) => {
    acc[key] = params[key]
    return acc
  }, {} as Record<string, string>)

  const signData = new URLSearchParams(sortedParams).toString()
  const hmac = crypto.createHmac('sha512', config.vnp_HashSecret)
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

  return {
    isValid: signed === vnp_SecureHash,
    responseCode: query.vnp_ResponseCode || '',
    orderId: (query.vnp_TxnRef || '').split('_')[0],
  }
}
