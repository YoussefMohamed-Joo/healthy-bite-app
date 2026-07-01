import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

const API = import.meta.env.VITE_API_URL || ''

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  delivering: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusAr = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  preparing: 'قيد التحضير',
  delivering: 'في التوصيل',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
}

export default function Orders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const headers = { Authorization: `Bearer ${token}` }

  const fetchOrders = async () => {
    const res = await fetch(`${API}/orders`, { headers })
    const data = await res.json()
    setOrders(data)
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (id, status) => {
    await fetch(`${API}/orders/${id}/status`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchOrders()
  }

  const nextStatus = (current) => {
    const flow = ['pending', 'confirmed', 'preparing', 'delivering', 'delivered']
    const idx = flow.indexOf(current)
    return idx < flow.length - 1 ? flow[idx + 1] : null
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-cairo text-xl font-bold text-zinc-900">الطلبات</h2>
        <p className="text-zinc-500 text-sm">{orders.length} طلب</p>
      </div>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order._id} className="bg-white rounded-2xl border border-zinc-100 p-5">
            <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
              <div>
                <p className="font-bold text-zinc-900">{order.customerName}</p>
                <p className="text-zinc-500 text-sm">{order.customerPhone} • {order.customerAddress}</p>
                <p className="text-zinc-400 text-xs mt-1">{new Date(order.createdAt).toLocaleString('ar-EG')}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColors[order.status]}`}>
                {statusAr[order.status]}
              </span>
            </div>
            <div className="border-t border-zinc-100 pt-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1">
                  <span className="text-zinc-600">{item.product?.nameAr || 'منتج'} × {item.quantity}</span>
                  <span className="text-zinc-900">{(item.price * item.quantity).toFixed(2)} $</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-zinc-900 pt-2 border-t border-zinc-100 mt-2">
                <span>المجموع</span>
                <span className="text-brand">{order.total?.toFixed(2)} $</span>
              </div>
            </div>
            {order.notes && <p className="text-zinc-500 text-xs mt-2">ملاحظات: {order.notes}</p>}
            <div className="flex gap-2 mt-3">
              {nextStatus(order.status) && (
                <Button size="sm" onClick={() => updateStatus(order._id, nextStatus(order.status))}>
                  ← {statusAr[nextStatus(order.status)]}
                </Button>
              )}
              {order.status !== 'cancelled' && order.status !== 'delivered' && (
                <Button size="sm" variant="danger" onClick={() => updateStatus(order._id, 'cancelled')}>
                  إلغاء
                </Button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-10 text-zinc-400">لا توجد طلبات</div>
        )}
      </div>
    </div>
  )
}
