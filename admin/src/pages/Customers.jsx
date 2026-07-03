import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { ShoppingBag, X } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function Customers() {
  const { token } = useAuth()
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [customerOrders, setCustomerOrders] = useState([])
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetch(`${API}/users/customers`, { headers })
      .then(r => r.json())
      .then(d => setCustomers(d.data || []))
      .catch(console.error)
  }, [])

  const viewOrders = async (c) => {
    setSelectedCustomer(c)
    const res = await fetch(`${API}/users/customers/${c._id}/orders`, { headers })
    const d = await res.json()
    setCustomerOrders(d.data || [])
  }

  const statusAr = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    preparing: 'قيد التحضير',
    delivering: 'في التوصيل',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-cairo text-xl font-bold text-zinc-900">العملاء</h2>
        <p className="text-zinc-500 text-sm">{customers.length} عميل</p>
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
              <th className="text-left p-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c._id} className="border-t border-zinc-100 hover:bg-zinc-50">
                <td className="p-4 font-medium text-zinc-900">{c.name}</td>
                <td className="p-4 text-zinc-600">{c.email}</td>
                <td className="p-4 text-zinc-600" dir="ltr">{c.phone || '—'}</td>
                <td className="p-4 text-center">
                  <span className="bg-brand-light text-brand text-xs font-semibold px-3 py-1 rounded-full">
                    {c.orderCount}
                  </span>
                </td>
                <td className="p-4 text-zinc-900 font-medium">{c.totalSpent.toFixed(2)} $</td>
                <td className="p-4 text-left">
                  <Button size="sm" variant="outline" onClick={() => viewOrders(c)}>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    الطلبات
                  </Button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-zinc-400">لا يوجد عملاء حتى الآن</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Orders Modal */}
      {selectedCustomer && (
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
                      order.status === 'delivering' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {statusAr[order.status]}
                    </span>
                    <span className="text-xs text-zinc-400">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                  </div>
                  {order.items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-xs py-0.5">
                      <span className="text-zinc-600">{item.product?.nameAr || 'منتج'} × {item.quantity}</span>
                      <span className="text-zinc-800">{(item.price * item.quantity).toFixed(2)} $</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-sm border-t border-zinc-100 pt-2 mt-2">
                    <span className="text-zinc-900">الإجمالي</span>
                    <span className="text-brand">{order.total?.toFixed(2)} $</span>
                  </div>
                </div>
              ))}
              {customerOrders.length === 0 && (
                <p className="text-zinc-400 text-sm text-center py-4">لا توجد طلبات</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
