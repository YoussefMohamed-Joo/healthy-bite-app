import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ name: '', text: '', rating: 5, avatar: '' })

  const fetchAll = async () => {
    try {
      const res = await fetch(`${API}/testimonials`)
      const d = await res.json()
      setTestimonials(d.data || [])
    } catch {}
  }

  useEffect(() => { fetchAll() }, [])

  const openCreate = () => { setEdit(null); setForm({ name: '', text: '', rating: 5, avatar: '' }); setShowModal(true) }

  const openEdit = (t) => { setEdit(t); setForm({ name: t.name, text: t.text, rating: t.rating, avatar: t.avatar }); setShowModal(true) }

  const save = async (e) => {
    e.preventDefault()
    if (edit) {
      await fetch(`${API}/testimonials/${edit._id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    } else {
      await fetch(`${API}/testimonials`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    }
    setShowModal(false)
    fetchAll()
  }

  const remove = async (id) => {
    if (!confirm('متأكد من الحذف؟')) return
    await fetch(`${API}/testimonials/${id}`, { method: 'DELETE', credentials: 'include' })
    fetchAll()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-cairo text-xl font-bold text-zinc-900">آراء العملاء</h2>
          <p className="text-zinc-500 text-sm">{testimonials.length} رأي</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> إضافة رأي</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map(t => (
          <div key={t._id} className="bg-white rounded-2xl border border-zinc-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand font-bold text-sm">
                  {t.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-zinc-900 text-sm">{t.name}</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= t.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'}`} />)}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button variant="danger" size="sm" onClick={() => remove(t._id)}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>
            <p className="text-zinc-600 text-sm leading-relaxed">{t.text}</p>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-cairo font-bold text-lg text-zinc-900 mb-4">{edit ? 'تعديل رأي' : 'إضافة رأي'}</h3>
            <form onSubmit={save} className="space-y-3">
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="الاسم" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              <textarea required value={form.text} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} placeholder="النص" rows={3} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" />
              <div>
                <p className="text-xs text-zinc-500 mb-1.5">التقييم</p>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(i => (
                    <button key={i} type="button" onClick={() => setForm(p => ({ ...p, rating: i }))} className="cursor-pointer">
                      <Star className={`w-6 h-6 ${i <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <input value={form.avatar} onChange={e => setForm(p => ({ ...p, avatar: e.target.value }))} placeholder="رابط الصورة (اختياري)" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
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
