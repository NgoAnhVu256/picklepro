'use client'

import { useEffect } from 'react'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/pickleball/header'
import { Footer } from '@/components/pickleball/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { MapPin, Phone, User, CreditCard, Banknote, Loader2, Shield, Lock, ArrowLeft, AlertCircle, QrCode, Landmark, Copy, CheckCircle, CheckCircle2, Clock, Download } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { validatePhone, formatPhoneInput, isPhoneValid } from '@/lib/validate-phone'
import { AddressPicker } from '@/components/pickleball/address-picker'

function formatPrice(p: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p)
}

function TimerCountDown({ initialSeconds }: { initialSeconds: number }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds)
  
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const m = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const s = (timeLeft % 60).toString().padStart(2, '0')
  return <span>{m}:{s}</span>
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
        setBankInfo({ ...data.bankInfo, finalAmount: data.totalAmount })
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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top Warning Banner */}
        <div className="w-full bg-[#fdfaf0] text-[#d9534f] text-xs sm:text-sm font-bold text-center py-2.5 border-b border-[#f3e5c7] shadow-sm z-10 sticky top-0">
          Quý Khách vui lòng không tắt trình duyệt cho đến khi nhận được kết quả giao dịch trên website. Xin cảm ơn!
        </div>

        <Header />
        
        <div className="flex-1 w-full mx-auto px-4 py-8 max-w-lg mb-10">
          
          {/* Timer */}
          <div className="text-center flex justify-center items-center gap-1.5 text-[#d9534f] font-bold mb-4">
            <Clock className="w-[18px] h-[18px]" />
            <span>Giao dịch hết hạn sau <TimerCountDown initialSeconds={267} /></span>
          </div>

          <div className="space-y-4">
            
            {/* QR Card */}
            <div className="bg-white rounded-[10px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden text-center p-5">
              <p className="text-[#005baa] font-bold text-sm leading-relaxed mb-3 mt-1 mx-auto max-w-[260px]">
                VUI LÒNG QUÉT MÃ BÊN DƯỚI ĐỂ THANH TOÁN CHUYỂN KHOẢN
              </p>

              <div className="flex justify-center p-1 relative mx-auto w-[240px] sm:w-[280px]">
                {/* VietQR compact2 image directly includes logos and QR */}
                <img
                  src={bankInfo.qrUrl}
                  alt="VietQR"
                  className="w-full h-auto"
                />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-center">
                <a href={bankInfo.qrUrl} download="Thanh_Toan_PicklePro.png" className="flex items-center justify-center gap-2 text-sm text-gray-700 hover:text-gray-900 py-1.5 px-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer w-fit">
                  <Download className="w-4 h-4 text-gray-500" /> Tải QR Code
                </a>
              </div>
            </div>

             {/* Bank Detail Box */}
             <div className="bg-white rounded-[10px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 p-5 text-[13px] sm:text-[14px]">
                <div className="text-emerald-700 font-bold mb-1">Thông tin chuyển khoản:</div>
                <div className="text-emerald-700 mb-1">{bankInfo.accountHolder}</div>
                <div className="text-emerald-700 mb-3">{bankInfo.bankName}</div>

                <div className="flex items-center justify-between py-1.5 border-t border-dashed border-gray-200">
                  <span className="text-emerald-700">Số tài khoản: <b>{bankInfo.accountNumber}</b></span>
                  <button onClick={() => copyText(String(bankInfo.accountNumber), 'account')} className="flex items-center gap-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs px-2 py-1 rounded transition-colors whitespace-nowrap">
                    {copied === 'account' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === 'account' ? 'Đã chép' : 'Sao chép STK'}
                  </button>
                </div>
                
                <div className="flex items-start justify-between py-1.5 pt-2 border-t border-dashed border-gray-200 mt-1 gap-2">
                  <span className="text-emerald-700 mt-1 leading-snug">
                     Nội dung chuyển khoản: <b className="text-emerald-800">{bankInfo.content}</b>
                  </span>
                  <button onClick={() => copyText(String(bankInfo.content), 'content')} className="flex items-center gap-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border border-yellow-200 text-xs px-2 py-1 rounded transition-colors whitespace-nowrap shrink-0 mt-0.5">
                    {copied === 'content' ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === 'content' ? 'Đã chép' : 'Sao chép'}
                  </button>
                </div>

                <div className="flex items-center justify-between py-1.5 pt-2 border-t border-dashed border-gray-200 mt-1">
                  <span className="text-emerald-700 mt-1">Số tiền: <b className="text-[#d9534f] text-[15px]">{formatPrice(bankInfo.finalAmount)}</b></span>
                </div>
             </div>

            {/* Buttons Group */}
            <div className="space-y-2 mt-6">
                <Link href="/account/orders" className="block w-full">
                  <Button className="w-full h-12 bg-[#dc3545] hover:bg-[#c82333] text-white font-bold rounded shadow-sm text-[15px]">
                    TÔI ĐÃ CHUYỂN KHOẢN
                  </Button>
                </Link>
                
                <Link href="/products" className="block w-full">
                  <Button variant="outline" className="w-full h-11 border-gray-200 text-gray-600 bg-[#f8f9fa] hover:bg-gray-100 rounded text-sm shadow-sm font-medium">
                    Hủy giao dịch
                  </Button>
                </Link>
            </div>

            {/* Hotline */}
            <div className="text-center mt-5">
              <span className="text-[#d9534f] text-[13px] font-bold">Hotline hỗ trợ: <a href="tel:18002097" className="underline">1800.2097</a></span>
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
          <Link href="/products"><Button className="rounded-full bg-lime-dark hover:bg-lime-dark/80 text-white">Xem sản phẩm</Button></Link>
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
                <Label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-lime-dark" /> Địa chỉ giao hàng
                </Label>
                <AddressPicker
                  onChange={(addr) => update('address', addr.fullAddress)}
                  initialAddress={form.address}
                />
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

            <Button type="submit" disabled={loading} className="w-full rounded-xl h-14 text-lg font-bold bg-lime-dark hover:bg-lime-dark/80 text-white shadow-lg shadow-lime-dark/20 active:scale-95 transition-all">
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
