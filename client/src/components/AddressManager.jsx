import { useState, useEffect } from 'react'
import { MapPin, Plus, Trash2, Check } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function AddressManager() {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const fetchAddresses = () => {
    fetch(`${API}/addresses`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setAddresses(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchAddresses() }, [])

  const handleDelete = async (id) => {
    await fetch(`${API}/addresses/${id}`, { method: 'DELETE', credentials: 'include' })
    fetchAddresses()
  }

  const handleSetDefault = async (id) => {
    await fetch(`${API}/addresses/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    })
    fetchAddresses()
  }

  if (loading) return null

  return (
    <div style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#237C3C]" />
          العنوانين
        </h3>
        <button
          onClick={() => setShowForm(p => !p)}
          className="flex items-center gap-1 px-3 py-1.5 bg-[#237C3C] text-white rounded-xl text-xs font-bold hover:bg-[#1A5E2E] transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          إضافة عنوان
        </button>
      </div>

      {showForm && (
        <AddressForm onSubmit={() => { setShowForm(false); fetchAddresses() }} />
      )}

      {addresses.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">لا توجد عنوانين. أضف عنوانك الأول.</p>
      ) : (
        <div className="space-y-3">
          {addresses.map(addr => (
            <div key={addr.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-gray-800">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-[#E8F5E9] text-[#237C3C] px-2 py-0.5 rounded-full font-bold">
                        افتراضي
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{addr.fullName}</p>
                  <p className="text-xs text-gray-400">{addr.phone}</p>
                  <p className="text-xs text-gray-500 mt-1">{addr.street}، {addr.city}</p>
                  {addr.notes && <p className="text-xs text-gray-400 mt-1">{addr.notes}</p>}
                </div>
                <div className="flex items-center gap-1">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-[#237C3C] transition-colors cursor-pointer"
                      title="تعيين كافتراضي"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddressForm({ onSubmit }) {
  const [form, setForm] = useState({ label: 'المنزل', fullName: '', phone: '', street: '', city: 'بني سويف', notes: '' })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await fetch(`${API}/addresses`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      onSubmit()
    } catch { /* ignore */ }
    setSending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">التصنيف</label>
          <select
            value={form.label}
            onChange={e => setForm(p => ({ ...p, label: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#237C3C]/30"
          >
            <option value="المنزل">المنزل</option>
            <option value="الشغل">الشغل</option>
            <option value="أخرى">أخرى</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">المدينة</label>
          <input
            value={form.city}
            onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#237C3C]/30"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">الاسم بالكامل</label>
        <input
          value={form.fullName}
          onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
          required
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#237C3C]/30"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">رقم الموبايل</label>
        <input
          value={form.phone}
          onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
          required
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#237C3C]/30"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">العنوان بالتفصيل</label>
        <input
          value={form.street}
          onChange={e => setForm(p => ({ ...p, street: e.target.value }))}
          required
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#237C3C]/30"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-700 mb-1">ملاحظات (اختياري)</label>
        <input
          value={form.notes}
          onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#237C3C]/30"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={sending}
          className="flex-1 py-2 bg-[#237C3C] text-white rounded-xl text-sm font-bold hover:bg-[#1A5E2E] disabled:opacity-50 transition-colors cursor-pointer"
        >
          {sending ? 'جاري...' : 'حفظ العنوان'}
        </button>
      </div>
    </form>
  )
}
