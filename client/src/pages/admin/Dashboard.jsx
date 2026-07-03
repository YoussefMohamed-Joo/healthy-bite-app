import { useState, useEffect } from 'react'
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, AlertCircle, UserCheck, BarChart3 } from 'lucide-react'
import { io } from 'socket.io-client'

const API = import.meta.env.VITE_API_URL || ''

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0 })
  const [analytics, setAnalytics] = useState({ todayRevenue: 0, pendingOrders: 0, activeUsers: 0 })
  const [chart, setChart] = useState({ weekly: [], thisMonth: 0, lastMonth: 0 })

  useEffect(() => {
    Promise.all([
      fetch(`${API}/products`).then(r => r.json()),
      fetch(`${API}/orders`, { credentials: 'include' }).then(r => r.json()),
      fetch(`${API}/users/customers`, { credentials: 'include' }).then(r => r.json()),
      fetch(`${API}/dashboard/analytics`, { credentials: 'include' }).then(r => r.json()),
      fetch(`${API}/dashboard/revenue-chart`, { credentials: 'include' }).then(r => r.json()),
    ]).then(([products, orders, customers, analyticsRes, chartRes]) => {
      const ordersData = orders.data || orders || []
      const customersData = customers.data || []
      setStats({
        products: (products.data || products)?.length || 0,
        orders: ordersData.length,
        customers: customersData.length,
        revenue: customersData.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
      })
      if (analyticsRes?.data) setAnalytics(analyticsRes.data)
      if (chartRes?.data) setChart(chartRes.data)
    }).catch(console.error)
  }, [])

  useEffect(() => {
    const socket = io(API, { transports: ['websocket', 'polling'] })
    socket.on('new_user_registered', () => {
      setStats(prev => ({ ...prev, customers: prev.customers + 1 }))
    })
    return () => socket.disconnect()
  }, [])

  const cards = [
    { label: 'المنتجات', value: stats.products, icon: Package, color: 'text-brand', bg: 'bg-brand-light' },
    { label: 'الطلبات', value: stats.orders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'العملاء', value: stats.customers, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'الإيرادات', value: `${stats.revenue.toFixed(2)} ج.م`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  const analyticsCards = [
    { label: 'إيرادات اليوم', value: `${analytics.todayRevenue.toFixed(2)} ج.م`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'طلبات معلقة', value: analytics.pendingOrders, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'مستخدمين نشطين', value: analytics.activeUsers, icon: UserCheck, color: 'text-sky-600', bg: 'bg-sky-50' },
  ]

  const maxRevenue = Math.max(...chart.weekly.map(d => d.revenue), 1)
  const monthChange = chart.lastMonth > 0 ? ((chart.thisMonth - chart.lastMonth) / chart.lastMonth * 100).toFixed(1) : 0

  return (
    <div>
      <h2 className="font-cairo text-xl font-bold text-zinc-900 mb-6">لوحة التحكم</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-zinc-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                <c.icon className={`w-5 h-5 ${c.color}`} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-zinc-900">{c.value}</p>
            <p className="text-zinc-500 text-sm">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Analytics */}
        {analyticsCards.map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
              <c.icon className={`w-6 h-6 ${c.color}`} />
            </div>
            <div>
              <p className="text-lg font-extrabold text-zinc-900">{c.value}</p>
              <p className="text-zinc-500 text-xs">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand" />
            <h3 className="font-cairo font-bold text-zinc-900">الإيرادات — آخر 7 أيام</h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="text-zinc-500">
              <span className="font-semibold text-zinc-900">{chart.thisMonth.toFixed(2)} ج.م</span> هذا الشهر
            </div>
            <div className={`font-semibold ${monthChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {monthChange > 0 ? '+' : ''}{monthChange}%
            </div>
          </div>
        </div>
        <div className="flex items-end gap-2 h-40">
          {chart.weekly.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full bg-brand-light rounded-t-lg relative" style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: d.revenue > 0 ? '8px' : '0' }}>
                {d.revenue > 0 && (
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-zinc-600 font-semibold whitespace-nowrap">{d.revenue.toFixed(1)}ج.م</span>
                )}
              </div>
              <span className="text-[10px] text-zinc-400">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
