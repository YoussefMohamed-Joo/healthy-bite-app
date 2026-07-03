import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, Tag } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ code: '', type: 'percentage', discount: '', minOrder: 0, maxUses: 0, expiresAt: '' })

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${API}/coupons`, { credentials: 'include' })
      const d = await res.json()
      setCoupons(d.data || [])
    } catch {}
  }

  useEffect(() => { fetchCoupons() }, [])

  const openCreate = () => {
    setEdit(null)
    setForm({ code: '', type: 'percentage', discount: '', minOrder: 0, maxUses: 0, expiresAt: '' })
    setShowModal(true)
  }

  const openEdit = (c) => {
    setEdit(c)
    setForm({
      code: c.code,
      type: c.type,
      discount: c.discount,
      minOrder: c.minOrder || 0,
      maxUses: c.maxUses || 0,
      expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString().slice(0, 16) : '',
    })
    setShowModal(true)
  }

  const save = async (e) => {
    e.preventDefault()
    const body = { ...form, discount: parseFloat(form.discount), minOrder: parseFloat(form.minOrder), maxUses: parseInt(form.maxUses) }
    if (edit) {
      await fetch(`${API}/coupons/${edit._id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    } else {
      await fetch(`${API}/coupons`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    }
    setShowModal(false)
    fetchCoupons()
  }

  const remove = async (id) => {
    if (!confirm('متأكد من الحذف؟')) return
    await fetch(`${API}/coupons/${id}`, { method: 'DELETE', credentials: 'include' })
    fetchCoupons()
  }

  const toggleActive = async (c) => {
    await fetch(`${API}/coupons/${c._id}`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !c.active }),
    })
    fetchCoupons()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-cairo text-xl font-bold text-zinc-900">كوبونات الخصم</h2>
          <p className="text-zinc-500 text-sm">{coupons.length} كوبون</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> إضافة كوبون</Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="text-right p-4 font-semibold">الكود</th>
              <th className="text-right p-4 font-semibold">الخصم</th>
              <th className="text-right p-4 font-semibold">النوع</th>
              <th className="text-center p-4 font-semibold">الاستخدام</th>
              <th className="text-right p-4 font-semibold">ينتهي</th>
              <th className="text-center p-4 font-semibold">مفعل</th>
              <th className="text-left p-4 font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(c => (
              <tr key={c._id} className={`border-t border-zinc-100 hover:bg-zinc-50 ${!c.active ? 'opacity-50' : ''}`}>
                <td className="p-4">
                  <span className="bg-brand-light text-brand text-xs font-bold px-3 py-1.5 rounded-lg tracking-wider">{c.code}</span>
                </td>
                <td className="p-4 font-semibold text-zinc-900">
                  {c.type === 'percentage' ? `${c.discount}%` : `${c.discount} ج.م`}
                </td>
                <td className="p-4 text-zinc-600">
                  {c.type === 'percentage' ? 'نسبة مئوية' : 'قيمة ثابتة'}
                </td>
                <td className="p-4 text-center">
                  <span className="text-zinc-700">{c.usedCount}{c.maxUses > 0 ? ` / ${c.maxUses}` : ''}</span>
                </td>
                <td className="p-4 text-zinc-500 text-xs">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('ar-EG') : 'لا ينتهي'}
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => toggleActive(c)} className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer ${c.active ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-400'}`}>
                    {c.active ? 'مفعل' : 'معطل'}
                  </button>
                </td>
                <td className="p-4 text-left">
                  <div className="flex gap-2 justify-start">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="danger" size="sm" onClick={() => remove(c._id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-zinc-400">لا توجد كوبونات</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-cairo font-bold text-lg text-zinc-900 mb-4">{edit ? 'تعديل كوبون' : 'إضافة كوبون'}</h3>
            <form onSubmit={save} className="space-y-3">
              <input required value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="الكود (مثلاً: WELCOME10)" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30">
                <option value="percentage">نسبة مئوية</option>
                <option value="fixed">قيمة ثابتة</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} placeholder={form.type === 'percentage' ? 'نسبة الخصم %' : 'قيمة الخصم ج.م'} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                <input type="number" step="0.01" value={form.minOrder} onChange={e => setForm(p => ({ ...p, minOrder: e.target.value }))} placeholder="الحد الأدنى" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.maxUses} onChange={e => setForm(p => ({ ...p, maxUses: e.target.value }))} placeholder="أقصى استخدام (0=غير محدود)" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                <input type="datetime-local" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">{edit ? 'تحديث' : 'إضافة'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>إلغاء</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
