import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function Checkout() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ product: i._id, quantity: i.quantity, price: i.price })),
          total,
          customerName: form.name,
          customerPhone: form.phone,
          customerAddress: form.address,
          notes: form.notes,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      clearCart()
      setDone(true)
    } catch (err) {
      alert('حدث خطأ، حاول مرة أخرى')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0 && !done) {
    navigate('/cart')
    return null
  }

  if (done) {
    return (
      <section className="min-h-screen bg-zinc-50 pt-[70px] flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-brand mx-auto mb-4" />
          <h2 className="font-cairo text-2xl font-bold text-zinc-900 mb-2">تم تأكيد الطلب! 🎉</h2>
          <p className="text-zinc-500 mb-6">هنوصلك في أسرع وقت</p>
          <Button onClick={() => navigate('/menu')}>اطلب تاني</Button>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-zinc-50 pt-[70px]">
      <div className="max-w-[600px] mx-auto px-6 py-10">
        <h1 className="font-cairo text-3xl font-bold text-zinc-900 mb-8">إتمام الطلب</h1>

        <div className="bg-white rounded-2xl border border-zinc-100 p-6 mb-6">
          <h3 className="font-cairo font-bold text-zinc-900 mb-3">ملخص الطلب</h3>
          {items.map(i => (
            <div key={i._id} className="flex justify-between text-sm py-1">
              <span className="text-zinc-600">{i.nameAr || i.name} × {i.quantity}</span>
              <span className="text-zinc-900">{(i.price * i.quantity).toFixed(2)} $</span>
            </div>
          ))}
          <div className="border-t border-zinc-100 pt-3 flex justify-between mt-2">
            <span className="font-bold text-zinc-900">المجموع</span>
            <span className="font-bold text-lg text-brand">{total.toFixed(2)} $</span>
          </div>
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4">
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="الاسم بالكامل" className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          <input required value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="رقم الهاتف" className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          <textarea required value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="العنوان بالتفصيل" rows={3} className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" />
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظات (اختياري)" rows={2} className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" />
          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? 'جاري التأكيد...' : 'تأكيد الطلب'}
          </Button>
        </form>
      </div>
    </section>
  )
}
