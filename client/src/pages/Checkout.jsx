import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { CheckCircle, Smartphone, Landmark, Wallet, Upload, Image } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const API = import.meta.env.VITE_API_URL || ''

const paymentMethods = [
  { id: 'cash', label: 'الدفع عند الاستلام', icon: Wallet, desc: 'ادفع كاش لما الطلب يوصل لك' },
  { id: 'vodafone_cash', label: 'فودافون كاش', icon: Smartphone, desc: 'ادفع عبر محفظة فودافون كاش' },
  { id: 'fawry', label: 'فوري', icon: Landmark, desc: 'ادفع عبر فوري' },
]

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' })
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [phoneWallet, setPhoneWallet] = useState('')
  const [receiptFile, setReceiptFile] = useState(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponResult, setCouponResult] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(null)

  if (!loading && !user) {
    navigate('/login')
    return null
  }

  if (items.length === 0 && !done) {
    navigate('/cart')
    return null
  }

  if (done) {
    return (
      <section className="min-h-screen bg-zinc-50 pt-[70px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <CheckCircle className="w-20 h-20 text-brand mx-auto mb-4" />
          <h2 className="font-cairo text-2xl font-bold text-zinc-900 mb-2">
            {done.paymentMethod === 'cash' ? 'تم تأكيد الطلب! 🎉' : 'بانتظار تأكيد الدفع! 🎉'}
          </h2>
          <p className="text-zinc-500 mb-2">
            {done.paymentMethod === 'cash'
              ? 'هنوصلك في أسرع وقت'
              : 'سيتم مراجعة الدفع وتأكيد الطلب من قبل الإدارة'}
          </p>
          <Button onClick={() => navigate('/my-orders')} className="mt-2">
            متابعة الطلب
          </Button>
        </div>
      </section>
    )
  }

  const discount = couponResult?.discountAmount || 0
  const finalTotal = Math.max(total - discount, 0)

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponResult(null)
    try {
      const res = await fetch(`${API}/coupons/validate`, {
        method: 'POST',
        credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, orderTotal: total }),
      })
      const json = await res.json()
      if (json.status === 'error') { setCouponResult({ error: json.message }); return }
      setCouponResult(json.data)
    } catch { setCouponResult({ error: 'فشل التحقق من الكود' }) }
    setCouponLoading(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (step === 0) { setStep(1); return }

    if (paymentMethod !== 'cash' && !receiptFile) {
      alert('يرجى إرفاق صورة الإيصال')
      return
    }

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('items', JSON.stringify(items.map(i => ({ product: i._id, quantity: i.quantity, price: i.price }))))
      fd.append('total', total)
      fd.append('customerName', form.name)
      fd.append('customerPhone', form.phone)
      if (form.email) fd.append('email', form.email)
      fd.append('customerAddress', form.address)
      fd.append('notes', form.notes)
      fd.append('paymentMethod', paymentMethod)
      if (couponResult?.discountAmount > 0) {
        fd.append('couponCode', couponCode)
        fd.append('total', finalTotal)
      }
      if (paymentMethod !== 'cash') {
        fd.append('phoneWallet', phoneWallet)
        if (receiptFile) fd.append('receipt', receiptFile)
      }

      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      clearCart()
      setDone(data.data || { paymentMethod })
    } catch (err) {
      alert('حدث خطأ، حاول مرة أخرى')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="min-h-screen bg-zinc-50 pt-[70px]">
      <div className="max-w-[600px] mx-auto px-6 py-10">
        <h1 className="font-cairo text-3xl font-bold text-zinc-900 mb-8">إتمام الطلب</h1>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-6 mb-6">
          <h3 className="font-cairo font-bold text-zinc-900 mb-3">ملخص الطلب</h3>
          {items.map(i => (
            <div key={i._id} className="flex justify-between text-sm py-1">
              <span className="text-zinc-600">{i.nameAr || i.name} × {i.quantity}</span>
              <span className="text-zinc-900">{(i.price * i.quantity).toFixed(2)} ج.م</span>
            </div>
          ))}

          {/* Coupon */}
          <div className="border-t border-zinc-100 pt-3 mt-2">
            <div className="flex gap-2 mb-2">
              <input value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="كود الخصم" className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand/30" />
              <button onClick={applyCoupon} disabled={couponLoading} className="px-4 py-2 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand/90 disabled:opacity-50 cursor-pointer border-none">
                {couponLoading ? '...' : 'تطبيق'}
              </button>
            </div>
            {couponResult?.error && <p className="text-red-500 text-xs">{couponResult.error}</p>}
            {couponResult?.discountAmount > 0 && (
              <p className="text-green-600 text-xs font-semibold">الخصم: -{couponResult.discountAmount.toFixed(2)} ج.م</p>
            )}
          </div>

          <div className="border-t border-zinc-100 pt-3 flex justify-between mt-2">
            <span className="font-bold text-zinc-900">المجموع</span>
            <div className="text-left">
              {discount > 0 && <span className="text-zinc-400 text-xs line-through block">{total.toFixed(2)} ج.م</span>}
              <span className="font-bold text-lg text-brand">{finalTotal.toFixed(2)} ج.م</span>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-6">
          {/* Step 1: Customer info */}
          {step === 0 && (
            <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
              <h3 className="font-cairo font-bold text-zinc-900 mb-1">بيانات التوصيل</h3>
              <input type="text" name="website_url" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }} />
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="الاسم بالكامل" className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              <input required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="رقم الهاتف" className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="الإيميل (لإشعارات الطلب)" type="email" className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              <textarea required value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="العنوان بالتفصيل" rows={3} className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" />
              <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظات (اختياري)" rows={2} className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" />

              <h3 className="font-cairo font-bold text-zinc-900 mt-6 mb-1">طريقة الدفع</h3>
              <div className="space-y-2">
                {paymentMethods.map(pm => (
                  <label
                    key={pm.id}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      paymentMethod === pm.id ? 'border-brand bg-brand-light/20' : 'border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} className="sr-only" />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMethod === pm.id ? 'border-brand' : 'border-zinc-300'
                    }`}>
                      {paymentMethod === pm.id && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                    </div>
                    <pm.icon className={`w-5 h-5 ${paymentMethod === pm.id ? 'text-brand' : 'text-zinc-400'}`} />
                    <div>
                      <p className={`text-sm font-semibold ${paymentMethod === pm.id ? 'text-brand' : 'text-zinc-900'}`}>{pm.label}</p>
                      <p className="text-xs text-zinc-400">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <Button type="submit" className="w-full" size="lg">
                التالي: تأكيد الدفع
              </Button>
            </div>
          )}

          {/* Step 2: Payment verification (for manual methods) */}
          {step === 1 && (
            <div className="space-y-6">
              {paymentMethod !== 'cash' ? (
                <>
                  {/* Instructions */}
                  <div className="bg-brand-light/20 border border-brand/20 rounded-2xl p-6 text-center">
                    <Smartphone className="w-10 h-10 text-brand mx-auto mb-3" />
                    <h3 className="font-cairo font-bold text-zinc-900 text-lg mb-2">حول المبلغ الآن</h3>
                    <p className="text-zinc-600 text-sm mb-1">
                      حول <span className="font-bold text-brand text-lg">{total.toFixed(2)} ج.م</span>
                    </p>
                    <p className="text-zinc-600 text-sm">
                      إلى محفظة فودافون كاش: <span className="font-bold text-zinc-900" dir="ltr">01033558125</span>
                    </p>
                    <p className="text-zinc-400 text-xs mt-2">الرقم خاص بمنصة HealthyBite</p>
                  </div>

                  {/* Verification Form */}
                  <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
                    <h3 className="font-cairo font-bold text-zinc-900 mb-1">بيانات التحويل</h3>
                    <input
                      required
                      value={phoneWallet}
                      onChange={e => setPhoneWallet(e.target.value)}
                      placeholder="رقم المحفظة المحول منها"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
                    />
                    <div>
                      <label className="block mb-2">
                        <div className="flex items-center gap-2 p-4 rounded-xl border-2 border-dashed border-zinc-300 hover:border-brand transition-colors cursor-pointer">
                          {receiptFile ? (
                            <>
                              <Image className="w-5 h-5 text-brand" />
                              <span className="text-sm text-zinc-700">{receiptFile.name}</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-zinc-400" />
                              <span className="text-sm text-zinc-500">إرفاق صورة الإيصال</span>
                            </>
                          )}
                        </div>
                        <input type="file" accept="image/*" onChange={e => setReceiptFile(e.target.files[0])} className="hidden" />
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl border border-zinc-100 p-6 text-center">
                  <Wallet className="w-10 h-10 text-brand mx-auto mb-3" />
                  <h3 className="font-cairo font-bold text-zinc-900 text-lg mb-2">الدفع عند الاستلام</h3>
                  <p className="text-zinc-500 text-sm">هتـدفع كاش لما الطلب يوصل لباب بيتك</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
                  رجوع
                </Button>
                <Button type="submit" className="flex-[2]" size="lg" disabled={submitting}>
                  {submitting ? 'جاري التأكيد...' : 'تأكيد الطلب'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </section>
  )
}
