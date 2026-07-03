import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, Smartphone, Globe, AlertTriangle, Clock, ShoppingBag, Eye, MapPin, Activity } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

const actionAr = {
  register: 'إنشاء الحساب', login: 'تسجيل دخول', order_placed: 'طلب جديد',
  order_cancelled: 'إلغاء طلب', profile_updated: 'تحديث البيانات',
  account_deactivated: 'إلغاء تنشيط الحساب', account_deleted: 'حذف الحساب',
}

const statusAr = {
  pending: 'قيد الانتظار', payment_pending: 'بانتظار التأكيد', confirmed: 'مؤكد',
  preparing: 'قيد التحضير', delivering: 'في التوصيل', delivered: 'تم التوصيل',
  cancelled: 'ملغي', rejected: 'مرفوض',
}

const deviceIcon = (d) => {
  if (!d) return <Smartphone className="w-3.5 h-3.5" />
  const s = d.toLowerCase()
  if (s.includes('android')) return '📱'
  if (s.includes('iphone') || s.includes('ipad')) return '🍎'
  return '💻'
}

const statusColor = (s) => {
  const map = {
    delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700',
    rejected: 'bg-rose-100 text-rose-700', delivering: 'bg-orange-100 text-orange-700',
    preparing: 'bg-purple-100 text-purple-700', payment_pending: 'bg-amber-100 text-amber-700',
    pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700',
  }
  return map[s] || 'bg-zinc-100 text-zinc-700'
}

export default function AdminCustomerDetail() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [orders, setOrders] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('info')

  useEffect(() => {
    Promise.all([
      fetch(`${API}/users/customers/${id}/details`, { credentials: 'include' }).then(r => r.json()),
      fetch(`${API}/users/customers/${id}/orders`, { credentials: 'include' }).then(r => r.json()),
      fetch(`${API}/users/customers/${id}/activities`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([details, ordersRes, activitiesRes]) => {
      setCustomer(details?.data || null)
      setOrders(ordersRes?.data || [])
      setActivities(activitiesRes?.data || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-500">العميل غير موجود</p>
        <Link to="/admin/customers" className="text-brand text-sm mt-2 inline-block">← العودة للعملاء</Link>
      </div>
    )
  }

  const formatTime = (t) => {
    if (!t) return '—'
    const d = new Date(t)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'منذ لحظات'
    if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} د`
    if (diff < 86400000) return `منذ ${Math.floor(diff / 3600000)} س`
    return d.toLocaleDateString('ar-EG') + ' ' + d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      <Link to="/admin/customers" className="flex items-center gap-1 text-sm text-zinc-500 hover:text-brand mb-4 no-underline">
        <ArrowRight className="w-4 h-4" /> العودة للعملاء
      </Link>

      <div className="bg-white rounded-2xl border border-zinc-100 p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-cairo text-xl font-bold text-zinc-900">{customer.name}</h2>
              {customer.suspiciousLogin && (
                <span className="flex items-center gap-1 text-[11px] bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-semibold">
                  <AlertTriangle className="w-3 h-3" /> متعدد الأجهزة/IP
                </span>
              )}
              {!customer.active && <span className="text-[11px] bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-semibold">ملغي</span>}
            </div>
            <p className="text-zinc-500 text-sm mt-1">{customer.email}</p>
            <p className="text-zinc-500 text-xs mt-0.5" dir="ltr">{customer.phone || '—'}</p>
          </div>
          <div className="flex gap-3 text-center">
            <div className="bg-brand-light rounded-xl px-4 py-3">
              <div className="font-bold text-brand text-lg">{customer.orderCount}</div>
              <div className="text-[10px] text-zinc-500">طلبات</div>
            </div>
            <div className="bg-amber-50 rounded-xl px-4 py-3">
              <div className="font-bold text-amber-600 text-lg">{customer.downloadCount}</div>
              <div className="text-[10px] text-zinc-500">تنزيلات</div>
            </div>
            <div className="bg-purple-50 rounded-xl px-4 py-3">
              <div className="font-bold text-purple-600 text-lg">{customer.ipHistory?.length || 0}</div>
              <div className="text-[10px] text-zinc-500">عناوين IP</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-zinc-200">
        {[
          { key: 'info', label: 'معلومات', icon: Eye },
          { key: 'activity', label: 'النشاط', icon: Activity },
          { key: 'orders', label: 'الطلبات', icon: ShoppingBag },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              tab === t.key ? 'border-brand text-brand' : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-zinc-100 p-5">
            <h3 className="font-cairo font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-brand" /> معلومات التسجيل
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">IP التسجيل</span><span className="font-mono text-xs" dir="ltr">{customer.registrationIp || '—'}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">جهاز التسجيل</span><span>{deviceIcon(customer.registrationDevice)} {customer.registrationDevice || '—'}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">تاريخ التسجيل</span><span className="text-xs">{formatTime(customer.createdAt)}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">آخر IP دخول</span><span className="font-mono text-xs" dir="ltr">{customer.lastLoginIp || '—'}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">آخر جهاز دخول</span><span>{deviceIcon(customer.lastLoginDevice)} {customer.lastLoginDevice || '—'}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 p-5">
            <h3 className="font-cairo font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> الأجهزة وعناوين IP
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-zinc-500 mb-2">الأجهزة المستخدمة:</p>
                <div className="flex flex-wrap gap-1.5">
                  {customer.devices?.length ? customer.devices.map((d, i) => (
                    <span key={i} className="text-xs bg-zinc-100 px-2 py-1 rounded-lg">{deviceIcon(d)} {d}</span>
                  )) : <span className="text-xs text-zinc-400">—</span>}
                </div>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-2">عناوين IP:</p>
                <div className="flex flex-wrap gap-1.5">
                  {customer.ipHistory?.length ? customer.ipHistory.map((ip, i) => (
                    <span key={i} className="text-[10px] font-mono bg-zinc-100 px-2 py-1 rounded-lg" dir="ltr">{ip}</span>
                  )) : <span className="text-xs text-zinc-400">—</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 p-5 md:col-span-2">
            <h3 className="font-cairo font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand" /> الجلسات (Sessions)
            </h3>
            <div className="space-y-2">
              {customer.sessions?.length ? customer.sessions.map((s, i) => (
                <div key={i} className="border border-zinc-100 rounded-xl p-3 text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="text-xs text-zinc-400">{formatTime(s.createdAt)}</span>
                  <span className="text-xs" dir="ltr">{s.ip ? `${s.ip}` : '—'}</span>
                  <span className="text-xs text-zinc-600 truncate max-w-[200px]">{s.device || '—'}</span>
                </div>
              )) : <p className="text-xs text-zinc-400">لا توجد جلسات</p>}
            </div>
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="space-y-3">
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
      )}

      {tab === 'orders' && (
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order._id} className="border border-zinc-100 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(order.status)}`}>
                    {statusAr[order.status] || order.status}
                  </span>
                  <span className="text-xs text-zinc-400">{formatTime(order.createdAt)}</span>
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
            {orders.length === 0 && <p className="text-zinc-400 text-sm text-center py-4">لا توجد طلبات</p>}
          </div>
        </div>
      )}
    </div>
  )
}
