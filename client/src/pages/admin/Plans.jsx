import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function AdminPlans() {
  const [plans, setPlans] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ name: '', nameAr: '', price: '', descriptionAr: '', features: [''], popular: false })

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${API}/plans`)
      const d = await res.json()
      setPlans(d.data || [])
    } catch {}
  }

  useEffect(() => { fetchPlans() }, [])

  const openCreate = () => {
    setEdit(null)
    setForm({ name: '', nameAr: '', price: '', descriptionAr: '', features: [''], popular: false })
    setShowModal(true)
  }

  const openEdit = (p) => {
    setEdit(p)
    setForm({ name: p.name, nameAr: p.nameAr, price: p.price, descriptionAr: p.descriptionAr || '', features: p.features?.length ? p.features : [''], popular: p.popular })
    setShowModal(true)
  }

  const save = async (e) => {
    e.preventDefault()
    const body = { ...form, price: parseFloat(form.price), features: form.features.filter(f => f.trim()) }
    const url = edit ? `${API}/plans/${edit._id}` : `${API}/plans`
    await fetch(url, { method: edit ? 'PUT' : 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setShowModal(false)
    fetchPlans()
  }

  const remove = async (id) => {
    if (!confirm('متأكد من الحذف؟')) return
    await fetch(`${API}/plans/${id}`, { method: 'DELETE', credentials: 'include' })
    fetchPlans()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-cairo text-xl font-bold text-zinc-900">خطط الاشتراك</h2>
          <p className="text-zinc-500 text-sm">{plans.length} خطة</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> إضافة خطة</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(p => (
          <div key={p._id} className={`bg-white rounded-2xl border-2 p-5 ${p.popular ? 'border-brand ring-2 ring-brand/20' : 'border-zinc-100'}`}>
            {p.popular && <span className="text-[10px] font-bold text-brand bg-brand-light px-3 py-1 rounded-full mb-2 inline-block">الأكثر طلباً</span>}
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs text-brand uppercase font-semibold">{p.name}</p>
                <h3 className="font-cairo font-extrabold text-zinc-900">{p.nameAr}</h3>
              </div>
              <span className="text-lg font-extrabold text-zinc-900">{p.price}<span className="text-xs text-zinc-400 mr-1">جنية</span></span>
            </div>
            {p.descriptionAr && <p className="text-zinc-500 text-xs mb-3">{p.descriptionAr}</p>}
            <ul className="space-y-1 mb-4">
              {p.features?.map((f, i) => (
                <li key={i} className="flex items-center gap-1.5 text-xs text-zinc-600"><Check className="w-3 h-3 text-brand shrink-0" />{f}</li>
              ))}
            </ul>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button variant="danger" size="sm" onClick={() => remove(p._id)}><Trash2 className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="font-cairo font-bold text-lg text-zinc-900 mb-4">{edit ? 'تعديل خطة' : 'إضافة خطة'}</h3>
            <form onSubmit={save} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="الاسم (English)" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                <input required value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} placeholder="الاسم بالعربي" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              </div>
              <input required type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="السعر (جنية)" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              <textarea value={form.descriptionAr} onChange={e => setForm(p => ({ ...p, descriptionAr: e.target.value }))} placeholder="الوصف" rows={2} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" />
              <div>
                <p className="text-xs text-zinc-500 mb-1.5">المميزات</p>
                {form.features.map((f, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input value={f} onChange={e => { const feats = [...form.features]; feats[i] = e.target.value; setForm(p => ({ ...p, features: feats })) }} placeholder="ميزة" className="flex-1 px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                    <button type="button" onClick={() => { if (form.features.length > 1) setForm(p => ({ ...p, features: p.features.filter((_, j) => j !== i) })) }} className="p-2 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setForm(p => ({ ...p, features: [...p.features, ''] }))} className="text-xs text-brand hover:underline cursor-pointer">+ إضافة ميزة</button>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.popular} onChange={e => setForm(p => ({ ...p, popular: e.target.checked }))} className="w-4 h-4 accent-brand" />
                <span className="text-sm text-zinc-700">الأكثر طلباً</span>
              </label>
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
