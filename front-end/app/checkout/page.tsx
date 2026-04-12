'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { MapPin, Phone, User, CreditCard, Banknote, Loader2, Shield, Lock, ArrowLeft, AlertCircle, QrCode, Landmark, Copy, CheckCircle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { validatePhone, formatPhoneInput, isPhoneValid } from '@/lib/validate-phone'

function formatPrice(p: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p)
}

export default function CheckoutPage() {
  const { items, getTotalPrice, getTotalItems, clearCart } = useCart()
  const router = useRouter()
  const [form, setForm] = useState({ name: '', address: '', phone: '', paymentMethod: 'cod' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [bankInfo, setBankInfo] = useState<any>(null)
  const [copied, setCopied] = useState('')

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handlePhoneChange = (value: string) => {
    const cleaned = formatPhoneInput(value)
    update('phone', cleaned)
    if (cleaned.length > 0) {
      setPhoneError(validatePhone(cleaned) ?? '')
    } else {
      setPhoneError('')
    }
  }

  const totalPrice = getTotalPrice()
  const shippingFee = totalPrice >= 500000 ? 0 : 30000
  const grandTotal = totalPrice + shippingFee

  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(''), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setBankInfo(null)

    const orderPayload = {
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      shippingName: form.name,
      shippingAddress: form.address,
      shippingPhone: form.phone,
      paymentMethod: form.paymentMethod,
    }

    try {
      if (form.paymentMethod === 'vnpay') {
        // VNPay → redirect tới cổng thanh toán VNPay
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        })
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Không thể tạo phiên thanh toán')
          setLoading(false)
          return
        }

        clearCart()
        window.location.href = data.checkoutUrl

      } else if (form.paymentMethod === 'bank_transfer') {
        // Chuyển khoản → hiển thị QR code
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        })
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Không thể tạo đơn hàng')
          setLoading(false)
          return
        }

        clearCart()
        setBankInfo(data.bankInfo)
        setLoading(false)

      } else {
        // COD → tạo đơn hàng + redirect success
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderPayload),
        })
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Không thể tạo đơn hàng')
          setLoading(false)
          return
        }

        clearCart()
        router.push(`/checkout/success?order_id=${data.order?.id || ''}`)
      }
    } catch (err) {
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.')
      setLoading(false)
    }
  }

  // Nếu có bankInfo → hiển thị QR chuyển khoản
  if (bankInfo) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto">
            <div className="rounded-3xl border border-lime/20 bg-gradient-to-b from-lime/5 to-transparent p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-lime/20 flex items-center justify-center">
                <QrCode className="h-8 w-8 text-lime-dark" />
              </div>
              <h2 className="text-2xl font-extrabold">Chuyển khoản ngân hàng</h2>
              <p className="text-muted-foreground text-sm">Quét QR hoặc chuyển khoản theo thông tin bên dưới</p>

              {/* QR Code */}
              <div className="bg-white rounded-2xl p-4 inline-block shadow-lg">
                <img
                  src={bankInfo.qrUrl}
                  alt="QR Chuyển khoản"
                  className="w-64 h-64 mx-auto"
                />
              </div>

              {/* Bank Details */}
              <div className="text-left space-y-3">
                {[
                  { label: 'Ngân hàng', value: bankInfo.bankName, field: 'bank' },
                  { label: 'Số tài khoản', value: bankInfo.accountNumber, field: 'account' },
                  { label: 'Chủ tài khoản', value: bankInfo.accountHolder, field: 'holder' },
                  { label: 'Nội dung CK', value: bankInfo.content, field: 'content' },
                  { label: 'Số tiền', value: formatPrice(grandTotal), field: 'amount' },
                ].map(({ label, value, field }) => (
                  <div key={field} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-lime/10">
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-bold text-foreground">{value}</p>
                    </div>
                    <button
                      onClick={() => copyText(String(value), field)}
                      className="p-2 rounded-lg hover:bg-lime/10 transition-colors"
                    >
                      {copied === field ? (
                        <CheckCircle className="h-4 w-4 text-lime-dark" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs text-left">
                ⚠️ Vui lòng nhập <b>đúng nội dung chuyển khoản</b> để đơn hàng được xác nhận tự động.
                Đơn hàng sẽ được xử lý trong vòng 5-10 phút sau khi nhận được thanh toán.
              </div>

              <div className="flex gap-3">
                <Link href="/account/orders" className="flex-1">
                  <Button className="w-full rounded-xl bg-lime hover:bg-lime-dark text-lime-dark hover:text-white font-bold">
                    Xem đơn hàng
                  </Button>
                </Link>
                <Link href="/products" className="flex-1">
                  <Button variant="outline" className="w-full rounded-xl border-lime/30">
                    Tiếp tục mua
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <span className="text-6xl block mb-4">🛒</span>
          <h2 className="text-2xl font-bold mb-2">Giỏ hàng trống</h2>
          <p className="text-muted-foreground mb-6">Vui lòng thêm sản phẩm trước khi thanh toán</p>
          <Link href="/products"><Button className="rounded-full bg-lime hover:bg-lime-dark text-lime-dark hover:text-white">Xem sản phẩm</Button></Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" className="p-2 rounded-full hover:bg-lime/10 transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Thanh Toán</h1>
            <p className="text-muted-foreground text-sm">{getTotalItems()} sản phẩm</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 text-sm flex items-center gap-3">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Shipping */}
            <div className="rounded-3xl border border-lime/20 bg-gradient-to-b from-lime/5 to-transparent p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><MapPin className="h-5 w-5 text-lime-dark" /> Thông tin giao hàng</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Họ và tên</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Nguyễn Văn A" value={form.name} onChange={e => update('name', e.target.value)} className="pl-10 rounded-xl border-lime/30 h-12" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Số điện thoại</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      placeholder="0912 345 678"
                      value={form.phone}
                      onChange={e => handlePhoneChange(e.target.value)}
                      maxLength={12}
                      inputMode="tel"
                      className={`pl-10 pr-10 rounded-xl h-12 transition-colors ${
                        phoneError
                          ? 'border-red-500 focus:border-red-500'
                          : form.phone && isPhoneValid(form.phone)
                          ? 'border-lime focus:border-lime'
                          : 'border-lime/30'
                      }`}
                      required
                    />
                    {/* Icon trạng thái */}
                    {form.phone && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isPhoneValid(form.phone)
                          ? <CheckCircle2 className="h-4 w-4 text-lime" />
                          : <AlertCircle className="h-4 w-4 text-red-500" />}
                      </span>
                    )}
                  </div>
                  {/* Thông báo lỗi */}
                  {phoneError && (
                    <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                      <AlertCircle className="h-3 w-3" /> {phoneError}
                    </p>
                  )}
                  {form.phone && isPhoneValid(form.phone) && (
                    <p className="text-lime text-xs flex items-center gap-1 mt-1">
                      <CheckCircle className="h-3 w-3" /> Số điện thoại hợp lệ
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Địa chỉ giao hàng</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Số nhà, đường, phường, quận, thành phố" value={form.address} onChange={e => update('address', e.target.value)} className="pl-10 rounded-xl border-lime/30 h-12" required />
                </div>
              </div>
            </div>

            {/* Payment Methods - Vietnamese */}
            <div className="rounded-3xl border border-lime/20 bg-gradient-to-b from-lime/5 to-transparent p-6 space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><CreditCard className="h-5 w-5 text-lime-dark" /> Phương thức thanh toán</h3>

              <RadioGroup value={form.paymentMethod} onValueChange={v => update('paymentMethod', v)} className="space-y-3">
                {/* COD */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === 'cod' ? 'border-lime bg-lime/10' : 'border-border hover:border-lime/40'}`}>
                  <RadioGroupItem value="cod" />
                  <Banknote className="h-6 w-6 text-lime-dark shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-xs text-muted-foreground">Thanh toán bằng tiền mặt khi shipper giao hàng</p>
                  </div>
                </label>

                {/* VNPay */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === 'vnpay' ? 'border-lime bg-lime/10' : 'border-border hover:border-lime/40'}`}>
                  <RadioGroupItem value="vnpay" />
                  <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                      <rect width="24" height="24" rx="4" fill="#005baa" />
                      <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">VN</text>
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-sm">VNPay</p>
                    <p className="text-xs text-muted-foreground">ATM nội địa, Visa, Mastercard, JCB, QR Pay</p>
                  </div>
                </label>

                {/* Bank Transfer */}
                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${form.paymentMethod === 'bank_transfer' ? 'border-lime bg-lime/10' : 'border-border hover:border-lime/40'}`}>
                  <RadioGroupItem value="bank_transfer" />
                  <Landmark className="h-6 w-6 text-blue-600 shrink-0" />
                  <div>
                    <p className="font-bold text-sm">Chuyển khoản ngân hàng</p>
                    <p className="text-xs text-muted-foreground">Quét mã QR bằng app ngân hàng (Vietcombank, MB, Techcombank...)</p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            <Button type="submit" disabled={loading} className="w-full rounded-xl h-14 text-lg font-bold bg-lime hover:bg-lime-dark text-lime-dark hover:text-white shadow-lg shadow-lime/30 active:scale-95 transition-all">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <>
                  {form.paymentMethod === 'vnpay' && 'Thanh toán qua VNPay'}
                  {form.paymentMethod === 'bank_transfer' && 'Tạo mã QR chuyển khoản'}
                  {form.paymentMethod === 'cod' && 'Đặt hàng (COD)'}
                  {' — '}{formatPrice(grandTotal)}
                </>
              )}
            </Button>

            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> Bảo mật SSL</span>
              <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Mã hóa dữ liệu</span>
            </div>
          </form>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-3xl border border-lime/20 bg-gradient-to-b from-lime/5 to-transparent p-6 space-y-4">
              <h3 className="text-lg font-bold">Đơn hàng của bạn</h3>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {items.map(item => (
                  <div key={item.productId} className="flex gap-3 py-2">
                    <div className="w-14 h-14 rounded-xl bg-lime/10 flex items-center justify-center shrink-0"><span className="text-2xl">🏓</span></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.brand} × {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold text-lime-dark whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-border" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>{formatPrice(totalPrice)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Vận chuyển</span><span>{shippingFee === 0 ? <span className="text-lime-dark font-medium">Miễn phí</span> : formatPrice(shippingFee)}</span></div>
                <div className="h-px bg-border" />
                <div className="flex justify-between text-lg font-bold"><span>Tổng cộng</span><span className="text-lime-dark">{formatPrice(grandTotal)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
