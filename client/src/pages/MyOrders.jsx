import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Package, RefreshCw, XCircle } from 'lucide-react'
import { io } from 'socket.io-client'

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

const cancelableStatuses = ['pending', 'payment_pending']

const steps = [
  { key: 'confirmed', label: 'مؤكد' },
  { key: 'preparing', label: 'قيد التحضير' },
  { key: 'delivering', label: 'خرج للتوصيل' },
  { key: 'delivered', label: 'تم التوصيل' },
]

function getStepIndex(status) {
  if (status === 'delivered') return 4
  if (status === 'delivering') return 3
  if (status === 'preparing') return 2
  if (status === 'confirmed') return 1
  return 0
}

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const intervalRef = useRef(null)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API}/orders`, { credentials: 'include' })
      const d = await res.json()
      setOrders(d.data || [])
    } catch {}
  }, [])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  useEffect(() => {
    const socket = io(API, { transports: ['websocket', 'polling'] })
    socket.on('order-status-update', () => { fetchOrders() })
    return () => socket.disconnect()
  }, [fetchOrders])

  useEffect(() => {
    intervalRef.current = setInterval(() => fetchOrders(), 15000)
    return () => clearInterval(intervalRef.current)
  }, [fetchOrders])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchOrders()
    setTimeout(() => setRefreshing(false), 500)
  }

  const cancelOrder = async (id) => {
    if (!confirm('هل أنت متأكد من إلغاء الطلب؟')) return
    try {
      await fetch(`${API}/orders/${id}/status`, {
        method: 'PUT',
        credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      fetchOrders()
    } catch {}
  }

  if (orders.length === 0) {
    return (
      <section className="min-h-screen bg-zinc-50 pt-[70px]">
        <div className="max-w-[800px] mx-auto px-6 py-14 text-center">
          <Package className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <h2 className="font-cairo text-2xl font-bold text-zinc-900 mb-2">لا توجد طلبات</h2>
          <p className="text-zinc-500">لم تقم بطلب أي وجبات بعد</p>
        </div>
      </section>
    )
  }

  return (
    <section className="min-h-screen bg-zinc-50 pt-[70px]">
      <div className="max-w-[800px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-cairo text-2xl font-bold text-zinc-900">طلباتي</h1>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            تحديث
          </button>
        </div>
        <div className="space-y-6">
          {orders.map((order, i) => {
            const stepIdx = getStepIndex(order.status)
            const isTerminal = order.status === 'cancelled' || order.status === 'rejected'
            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                className="bg-white rounded-2xl border border-zinc-100 p-5"
              >
                <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                  <div>
                    <p className="text-xs text-zinc-400">{new Date(order.createdAt).toLocaleString('ar-EG')}</p>
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColors[order.status]}`}>
                    {statusAr[order.status]}
                  </span>
                </div>

                {/* Visual Progress */}
                {!isTerminal && (
                  <div className="flex items-center gap-1 mb-4 px-1">
                    {steps.map((s, idx) => (
                      <div key={s.key} className="flex-1 flex items-center">
                        <div className={`w-full h-1.5 rounded-full ${idx <= stepIdx ? 'bg-brand' : 'bg-zinc-200'}`} />
                        {idx < steps.length - 1 && <div className="w-1" />}
                      </div>
                    ))}
                    <div className="flex items-center gap-1.5 mr-2 shrink-0">
                      {steps.map((s, idx) => (
                        <div key={s.key} className={`w-2 h-2 rounded-full ${idx <= stepIdx ? 'bg-brand' : 'bg-zinc-200'}`} title={s.label} />
                      ))}
                    </div>
                  </div>
                )}

                {order.status === 'rejected' && order.paymentInfo?.rejectionReason && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 mb-3">
                    <p className="text-xs text-rose-700">سبب الرفض: {order.paymentInfo.rejectionReason}</p>
                  </div>
                )}

                <div className="border-t border-zinc-100 pt-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-1">
                      <span className="text-zinc-600">{item.product?.nameAr || 'منتج'} × {item.quantity}</span>
                      <span className="text-zinc-900">{(item.price * item.quantity).toFixed(2)} ج.م</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-zinc-900 pt-2 border-t border-zinc-100 mt-2">
                    <span>المجموع</span>
                    <span className="text-brand">{order.total?.toFixed(2)} ج.م</span>
                  </div>
                </div>

                {cancelableStatuses.includes(order.status) && (
                  <button
                    onClick={() => cancelOrder(order._id)}
                    className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    إلغاء الطلب
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
