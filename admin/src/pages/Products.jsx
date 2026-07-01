import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function Products() {
  const { token } = useAuth()
  const [products, setProducts] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [edit, setEdit] = useState(null)
  const [form, setForm] = useState({ name: '', nameAr: '', price: '', calories: '', descriptionAr: '', category: 'main' })

  const headers = { Authorization: `Bearer ${token}` }

  const fetchProducts = async () => {
    const res = await fetch(`${API}/products`, { headers })
    const data = await res.json()
    setProducts(data)
  }

  useEffect(() => { fetchProducts() }, [])

  const openEdit = (p) => {
    setEdit(p)
    setForm({ name: p.name, nameAr: p.nameAr, price: p.price, calories: p.calories, descriptionAr: p.descriptionAr, category: p.category })
    setShowModal(true)
  }

  const openCreate = () => {
    setEdit(null)
    setForm({ name: '', nameAr: '', price: '', calories: '', descriptionAr: '', category: 'main' })
    setShowModal(true)
  }

  const save = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    const fileInput = document.getElementById('productImage')
    if (fileInput?.files[0]) fd.append('image', fileInput.files[0])

    const url = edit ? `${API}/products/${edit._id}` : `${API}/products`
    const method = edit ? 'PUT' : 'POST'
    await fetch(url, { method, headers: { ...headers }, body: fd })
    setShowModal(false)
    fetchProducts()
  }

  const remove = async (id) => {
    if (!confirm('متأكد من الحذف؟')) return
    await fetch(`${API}/products/${id}`, { method: 'DELETE', headers })
    fetchProducts()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-cairo text-xl font-bold text-zinc-900">المنتجات</h2>
          <p className="text-zinc-500 text-sm">{products.length} منتج</p>
        </div>
        <Button onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" /> إضافة منتج</Button>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="text-right p-4 font-semibold">الاسم</th>
              <th className="text-right p-4 font-semibold">السعر</th>
              <th className="text-right p-4 font-semibold">السعرات</th>
              <th className="text-right p-4 font-semibold">القسم</th>
              <th className="text-left p-4 font-semibold">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} className="border-t border-zinc-100 hover:bg-zinc-50">
                <td className="p-4 font-medium text-zinc-900">{p.nameAr}</td>
                <td className="p-4 text-zinc-600">{p.price} $</td>
                <td className="p-4 text-zinc-600">{p.calories}</td>
                <td className="p-4"><span className="bg-brand-light text-brand text-xs font-semibold px-3 py-1 rounded-full">{p.category}</span></td>
                <td className="p-4">
                  <div className="flex gap-2 justify-start">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="danger" size="sm" onClick={() => remove(p._id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-cairo font-bold text-lg text-zinc-900 mb-4">{edit ? 'تعديل منتج' : 'إضافة منتج'}</h3>
            <form onSubmit={save} className="space-y-3">
              <input required value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))} placeholder="الاسم بالعربي" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="الاسم بالإنجليزية" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              <div className="grid grid-cols-2 gap-3">
                <input required type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="السعر" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                <input required type="number" value={form.calories} onChange={e => setForm(p => ({ ...p, calories: e.target.value }))} placeholder="السعرات" className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
              </div>
              <textarea value={form.descriptionAr} onChange={e => setForm(p => ({ ...p, descriptionAr: e.target.value }))} placeholder="الوصف" rows={2} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" />
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-4 py-2.5 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30">
                <option value="main">رئيسي</option>
                <option value="salad">سلطة</option>
                <option value="drink">مشروب</option>
                <option value="snack">مقبلات</option>
              </select>
              <input id="productImage" type="file" accept="image/*" className="w-full text-sm" />
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
