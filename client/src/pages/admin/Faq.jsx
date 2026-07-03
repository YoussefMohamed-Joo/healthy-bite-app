import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Save, X } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function AdminFaq() {
  const [faqs, setFaqs] = useState([])
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ question: '', answer: '', order: 0 })
  const [showNew, setShowNew] = useState(false)

  const fetchFaqs = async () => {
    try {
      const res = await fetch(`${API}/faq?all=true`, { credentials: 'include' })
      const d = await res.json()
      setFaqs(d.data || [])
    } catch {}
  }

  useEffect(() => { fetchFaqs() }, [])

  const create = async () => {
    if (!editForm.question || !editForm.answer) return
    await fetch(`${API}/faq`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: editForm.question, answer: editForm.answer, order: faqs.length + 1 }),
    })
    setEditForm({ question: '', answer: '', order: 0 })
    setShowNew(false)
    fetchFaqs()
  }

  const update = async (id) => {
    await fetch(`${API}/faq/${id}`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: editForm.question, answer: editForm.answer }),
    })
    setEditId(null)
    setEditForm({ question: '', answer: '', order: 0 })
    fetchFaqs()
  }

  const remove = async (id) => {
    if (!confirm('حذف هذا السؤال؟')) return
    await fetch(`${API}/faq/${id}`, { method: 'DELETE', credentials: 'include' })
    fetchFaqs()
  }

  const toggleActive = async (faq) => {
    await fetch(`${API}/faq/${faq._id}`, {
      method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !faq.active }),
    })
    fetchFaqs()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-cairo text-xl font-bold text-zinc-900">الأسئلة الشائعة</h2>
          <p className="text-zinc-500 text-sm">{faqs.length} سؤال</p>
        </div>
        <button
          onClick={() => { setShowNew(!showNew); setEditForm({ question: '', answer: '', order: 0 }) }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          إضافة سؤال
        </button>
      </div>

      {showNew && (
        <div className="bg-brand-light/30 rounded-2xl border border-brand/20 p-5 mb-6 space-y-3">
          <input value={editForm.question} onChange={e => setEditForm(p => ({ ...p, question: e.target.value }))} placeholder="السؤال" className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          <textarea value={editForm.answer} onChange={e => setEditForm(p => ({ ...p, answer: e.target.value }))} placeholder="الإجابة" rows={3} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" />
          <div className="flex gap-2">
            <button onClick={create} className="px-4 py-2 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark cursor-pointer">حفظ</button>
            <button onClick={() => setShowNew(false)} className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 text-sm cursor-pointer">إلغاء</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {faqs.map(faq => (
          <div key={faq._id} className="bg-white rounded-2xl border border-zinc-100 p-5">
            {editId === faq._id ? (
              <div className="space-y-3">
                <input value={editForm.question} onChange={e => setEditForm(p => ({ ...p, question: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                <textarea value={editForm.answer} onChange={e => setEditForm(p => ({ ...p, answer: e.target.value }))} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" />
                <div className="flex gap-2">
                  <button onClick={() => update(faq._id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold cursor-pointer"><Save className="w-3.5 h-3.5" /> حفظ</button>
                  <button onClick={() => setEditId(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 text-xs cursor-pointer"><X className="w-3.5 h-3.5" /> إلغاء</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900 text-sm mb-1">{faq.question}</p>
                    <p className="text-zinc-500 text-xs line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => toggleActive(faq)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold cursor-pointer ${
                        faq.active ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-400'
                      }`}
                    >
                      {faq.active ? 'ظاهر' : 'مخفي'}
                    </button>
                    <button
                      onClick={() => { setEditId(faq._id); setEditForm({ question: faq.question, answer: faq.answer, order: faq.order }) }}
                      className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => remove(faq._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
