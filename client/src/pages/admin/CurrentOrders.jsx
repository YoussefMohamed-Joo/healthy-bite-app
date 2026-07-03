import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const API = import.meta.env.VITE_API_URL || ''

const activeStatuses = ['confirmed', 'preparing', 'delivering']

const statusColors = {
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  delivering: 'bg-orange-100 text-orange-700',
}

const statusAr = {
  confirmed: 'مؤكد', preparing: 'قيد التحضير', delivering: 'خرج للتوصيل',
}

const validTransitions = {
  confirmed: [{ value: 'preparing', label: 'بدء التحضير' }, { value: 'cancelled', label: 'إلغاء' }],
  preparing: [{ value: 'delivering', label: 'خرج للتوصيل' }, { value: 'cancelled', label: 'إلغاء' }],
  delivering: [{ value: 'delivered', label: 'تم التوصيل' }],
}

export default function AdminCurrentOrders() {
  const [orders, setOrders] = useState([])

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/orders`, { credentials: 'include' })
      const data = await res.json()
      const all = data.data || data || []
      setOrders(all.filter(o => activeStatuses.includes(o.status)))
    } catch { /* ignore */ }
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (id, status) => {
    await fetch(`${API}/orders/${id}/status`, {
      method: 'PUT',
      credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchOrders()
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-cairo text-xl font-bold text-zinc-900">الطلبات الحالية</h2>
        <p className="text-zinc-500 text-sm">{orders.length} طلب نشط</p>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-zinc-100 p-5"
          >
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
          </motion.div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-10 text-zinc-400">لا توجد طلبات حالية</div>
        )}
      </div>
    </div>
  )
}
