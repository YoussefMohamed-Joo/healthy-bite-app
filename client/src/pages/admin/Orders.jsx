import { useState, useEffect } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  payment_pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  delivering: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  rejected: 'bg-rose-100 text-rose-700',
}

const statusAr = {
  pending: 'قيد الانتظار', payment_pending: 'بانتظار تأكيد الدفع',
  confirmed: 'مؤكد', preparing: 'قيد التحضير',
  delivering: 'خرج للتوصيل', delivered: 'تم التوصيل',
  cancelled: 'ملغي', rejected: 'مرفوض',
}

const validTransitions = {
  pending: [{ value: 'confirmed', label: 'تأكيد الطلب' }, { value: 'cancelled', label: 'إلغاء' }],
  payment_pending: [{ value: 'preparing', label: 'تأكيد الدفع' }, { value: 'cancelled', label: 'إلغاء' }],
  confirmed: [{ value: 'preparing', label: 'بدء التحضير' }, { value: 'cancelled', label: 'إلغاء' }],
  preparing: [{ value: 'delivering', label: 'خرج للتوصيل' }, { value: 'cancelled', label: 'إلغاء' }],
  delivering: [{ value: 'delivered', label: 'تم التوصيل' }],
  delivered: [],
  cancelled: [],
  rejected: [],
}

const allStatuses = Object.keys(statusAr)

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchOrders = async (p = 1) => {
    try {
      const url = `${API}/orders?page=${p}&limit=10${statusFilter ? `&status=${statusFilter}` : ''}`
      const res = await fetch(url, { credentials: 'include' })
      const data = await res.json()
      setOrders(data.data || [])
      if (data.pagination) setTotalPages(data.pagination.totalPages)
    } catch { /* ignore */ }
  }

  useEffect(() => { fetchOrders(page) }, [page, statusFilter])

  const updateStatus = async (id, status) => {
    await fetch(`${API}/orders/${id}/status`, {
      method: 'PUT',
      credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchOrders(page)
  }

  const filtered = orders.filter(o =>
    !search || o.customerName?.includes(search) || o.customerPhone?.includes(search) || o.customerAddress?.includes(search)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-cairo text-xl font-bold text-zinc-900">الطلبات</h2>
          <p className="text-zinc-500 text-sm">{filtered.length} طلب</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث..." className="pr-9 pl-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand/30 w-40" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 cursor-pointer">
            <option value="">كل الحالات</option>
            {allStatuses.map(s => <option key={s} value={s}>{statusAr[s]}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(order => (
          <div key={order._id} className="bg-white rounded-2xl border border-zinc-100 p-5">
            <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-zinc-900">{order.customerName}</p>
                <p className="text-zinc-500 text-xs">{order.customerPhone}</p>
                <p className="text-zinc-400 text-xs">{order.customerAddress}</p>
              </div>
              <div className="text-left">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColors[order.status]}`}>
                  {statusAr[order.status]}
                </span>
                <p className="text-zinc-400 text-[10px] mt-1">{new Date(order.createdAt).toLocaleString('ar-EG')}</p>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-zinc-600">{item.product?.nameAr || 'منتج'} × {item.quantity}</span>
                  <span className="text-zinc-900">{(item.price * item.quantity).toFixed(2)} ج.م</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-zinc-900 pt-2 border-t border-zinc-100 mt-2">
                <span>المجموع</span>
                <span className="text-brand">{order.total?.toFixed(2)} ج.م</span>
              </div>
            </div>

            {order.notes && <p className="text-zinc-500 text-xs mt-2">ملاحظات: {order.notes}</p>}

            <div className="flex gap-2 mt-3">
              <select
                value=""
                onChange={e => { if (e.target.value) updateStatus(order._id, e.target.value) }}
                className="px-3 py-2 rounded-lg border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 cursor-pointer"
              >
                <option value="" disabled>تغيير الحالة...</option>
                {validTransitions[order.status]?.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-zinc-400">لا توجد طلبات</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 cursor-pointer">
            <ChevronRight className="w-3.5 h-3.5" /> السابق
          </button>
          <span className="text-xs text-zinc-500">صفحة {page} من {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-50 disabled:opacity-30 cursor-pointer">
            التالي <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
