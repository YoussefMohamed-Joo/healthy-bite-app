import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Smartphone, Image as ImageIcon, ExternalLink, Loader2 } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function AdminPaymentVerification() {
  const [orders, setOrders] = useState([])
  const [rejectId, setRejectId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/orders/payment-pending`, { credentials: 'include' })
      const d = await res.json()
      setOrders(d.data || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchOrders() }, [])

  const verify = async (id) => {
    setActionLoading(id)
    await fetch(`${API}/orders/${id}/verify`, { method: 'POST', credentials: 'include' })
    setActionLoading(null)
    fetchOrders()
  }

  const reject = async (id) => {
    if (!rejectReason.trim()) return
    setActionLoading(id)
    await fetch(`${API}/orders/${id}/reject-payment`, {
      method: 'POST',
      credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: rejectReason }),
    })
    setActionLoading(null)
    setRejectId(null)
    setRejectReason('')
    fetchOrders()
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-cairo text-xl font-bold text-zinc-900">التحقق من الدفع</h2>
        <p className="text-zinc-500 text-sm">{orders.length} طلب بانتظار التأكيد</p>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-16 text-zinc-400">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
          <p>لا توجد طلبات بانتظار التحقق من الدفع</p>
        </div>
      )}

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
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700">
                  بانتظار التأكيد
                </span>
                <p className="text-zinc-400 text-[10px] mt-1">{new Date(order.createdAt).toLocaleString('ar-EG')}</p>
              </div>
            </div>

            {/* Items */}
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

            {/* Payment Details */}
            <div className="border-t border-zinc-100 mt-3 pt-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs">
                <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-500">طريقة الدفع:</span>
                <span className="text-zinc-700 font-semibold">
                  {order.paymentInfo?.method === 'vodafone_cash' ? 'فودافون كاش' : 'فوري'}
                </span>
              </div>
              {order.paymentInfo?.phoneWallet && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-zinc-500">محفظة المرسل:</span>
                  <span className="text-zinc-700 font-semibold" dir="ltr">{order.paymentInfo.phoneWallet}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-3.5 h-3.5 flex items-center justify-center text-zinc-400 font-mono text-[10px]">#</span>
                <span className="text-zinc-500">رقم العملية:</span>
                <span className="text-zinc-700 font-semibold" dir="ltr">{order.paymentInfo?.transactionId || '—'}</span>
              </div>
              {order.paymentInfo?.receiptImage && (
                <a
                  href={order.paymentInfo.receiptImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-brand hover:underline mt-1"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  عرض الإيصال
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Actions */}
            {rejectId === order._id ? (
              <div className="mt-4 space-y-2">
                <textarea
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="اكتب سبب الرفض..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-red-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => reject(order._id)}
                    disabled={!rejectReason.trim() || actionLoading === order._id}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading === order._id ? 'جاري...' : 'تأكيد الرفض'}
                  </button>
                  <button onClick={() => { setRejectId(null); setRejectReason('') }} className="px-4 py-2 rounded-xl border border-zinc-200 text-zinc-600 text-xs cursor-pointer">
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => verify(order._id)}
                  disabled={actionLoading === order._id}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold hover:bg-green-600 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading === order._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  تأكيد الدفع
                </button>
                <button
                  onClick={() => setRejectId(order._id)}
                  disabled={actionLoading === order._id}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  رفض
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
