import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Eye, X, Search } from 'lucide-react'
import { io } from 'socket.io-client'

const API = import.meta.env.VITE_API_URL || ''

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])
  const [activities, setActivities] = useState([])
  const [showActivities, setShowActivities] = useState(false)

  useEffect(() => {
    fetch(`${API}/users/customers`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setCustomers(d.data || []))
      .catch(console.error)
  }, [])

  useEffect(() => {
    const socket = io(API, { transports: ['websocket', 'polling'] })
    socket.on('new_user_registered', (user) => {
      setCustomers(prev => [{ ...user, orderCount: 0, totalSpent: 0 }, ...prev])
    })
    return () => socket.disconnect()
  }, [])

  const viewOrders = async (c) => {
    setSelectedCustomer(c)
    setShowActivities(false)
    const res = await fetch(`${API}/users/customers/${c._id}/orders`, { credentials: 'include' })
    const d = await res.json()
    setCustomerOrders(d.data || [])
  }

  const viewActivities = async (c) => {
    setSelectedCustomer(c)
    setShowActivities(true)
    const res = await fetch(`${API}/users/customers/${c._id}/activities`, { credentials: 'include' })
    const d = await res.json()
    setActivities(d.data || [])
  }

  const actionAr = {
    register: 'إنشاء الحساب',
    login: 'تسجيل دخول',
    order_placed: 'طلب جديد',
    order_cancelled: 'إلغاء طلب',
    profile_updated: 'تحديث البيانات',
    account_deleted: 'حذف الحساب',
  }

  const statusAr = {
    pending: 'قيد الانتظار', payment_pending: 'بانتظار التأكيد', confirmed: 'مؤكد', preparing: 'قيد التحضير',
    delivering: 'في التوصيل', delivered: 'تم التوصيل', cancelled: 'ملغي', rejected: 'مرفوض',
  }

  const formatTime = (t) => {
    const d = new Date(t)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'منذ لحظات'
    if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} د`
    if (diff < 86400000) return `منذ ${Math.floor(diff / 3600000)} س`
    return d.toLocaleDateString('ar-EG')
  }

  const filtered = customers.filter(c =>
    !search || c.name?.includes(search) || c.email?.includes(search) || c.phone?.includes(search)
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-cairo text-xl font-bold text-zinc-900">العملاء</h2>
          <p className="text-zinc-500 text-sm">{customers.length} عميل</p>
        </div>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث بالاسم أو البريد..." className="pr-9 pl-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand/30 w-56" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-zinc-600">
            <tr>
              <th className="text-right p-4 font-semibold">الاسم</th>
              <th className="text-right p-4 font-semibold">البريد</th>
              <th className="text-right p-4 font-semibold">الهاتف</th>
              <th className="text-center p-4 font-semibold">الطلبات</th>
              <th className="text-left p-4 font-semibold">الإجمالي</th>
              <th className="text-right p-4 font-semibold">تاريخ التسجيل</th>
              <th className="text-left p-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c._id} className={`border-t border-zinc-100 hover:bg-zinc-50 ${c.active === false ? 'opacity-60' : ''}`}>
                <td className="p-4 font-medium text-zinc-900">
                  {c.name}
                  {c.active === false && <span className="mr-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">ملغي</span>}
                </td>
                <td className="p-4 text-zinc-600">{c.email}</td>
                <td className="p-4 text-zinc-600" dir="ltr">{c.phone || '—'}</td>
                <td className="p-4 text-center"><span className="bg-brand-light text-brand text-xs font-semibold px-3 py-1 rounded-full">{c.orderCount}</span></td>
                <td className="p-4 text-zinc-900 font-medium">{c.totalSpent.toFixed(2)} ج.م</td>
                <td className="p-4 text-zinc-400 text-xs">{formatTime(c.createdAt)}</td>
                <td className="p-4 text-left flex gap-1 justify-end">
                  <Button size="sm" variant="ghost" onClick={() => viewOrders(c)}>
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => viewActivities(c)}>
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-zinc-400">لا يوجد عملاء</td></tr>}
          </tbody>
        </table>
      </div>

      {selectedCustomer && !showActivities && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedCustomer(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <div>
                <h3 className="font-cairo font-bold text-zinc-900">طلبات {selectedCustomer.name}</h3>
                <p className="text-zinc-400 text-xs">{selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 hover:bg-zinc-100 rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {customerOrders.map(order => (
                <div key={order._id} className="border border-zinc-100 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      order.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                      order.status === 'delivering' ? 'bg-orange-100 text-orange-700' :
                      order.status === 'preparing' ? 'bg-purple-100 text-purple-700' :
                      order.status === 'payment_pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{statusAr[order.status] || order.status}</span>
                    <span className="text-xs text-zinc-400">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs py-0.5">
                      <span className="text-zinc-600">{item.product?.nameAr || 'منتج'} × {item.quantity}</span>
                      <span className="text-zinc-800">{(item.price * item.quantity).toFixed(2)} ج.م</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-sm border-t border-zinc-100 pt-2 mt-2">
                    <span className="text-zinc-900">الإجمالي</span>
                    <span className="text-brand">{order.total?.toFixed(2)} ج.م</span>
                  </div>
                </div>
              ))}
              {customerOrders.length === 0 && <p className="text-zinc-400 text-sm text-center py-4">لا توجد طلبات</p>}
            </div>
          </div>
        </div>
      )}

      {selectedCustomer && showActivities && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedCustomer(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-zinc-100">
              <div>
                <h3 className="font-cairo font-bold text-zinc-900">نشاط {selectedCustomer.name}</h3>
                <p className="text-zinc-400 text-xs">{selectedCustomer.email}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 hover:bg-zinc-100 rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {activities.map((a, i) => (
                <div key={a._id || i} className="flex items-start gap-3 border border-zinc-100 rounded-xl p-4">
                  <div className="w-2 h-2 rounded-full bg-brand mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900">{actionAr[a.action] || a.action}</p>
                    {a.details && <p className="text-xs text-zinc-500 mt-0.5">{a.details}</p>}
                    <p className="text-[10px] text-zinc-400 mt-1">{formatTime(a.createdAt)}</p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && <p className="text-zinc-400 text-sm text-center py-4">لا توجد نشاطات</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
