import { useState, useEffect } from 'react'
import { Smartphone, Download, BarChart3, TrendingUp, Users } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function AdminAppDownloads() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/dashboard/analytics`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full" />
      </div>
    )
  }

  const downloadStats = stats?.downloadStats || { total: 0, android: 0, ios: 0, today: 0, thisWeek: 0 }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-cairo text-xl font-bold text-zinc-900">إحصائيات التنزيل</h2>
          <p className="text-zinc-500 text-sm">متتبع تنزيلات التطبيق</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
              <Download className="w-5 h-5 text-brand" />
            </div>
          </div>
          <div className="font-bold text-2xl text-zinc-900">{downloadStats.total}</div>
          <div className="text-xs text-zinc-500 mt-0.5">إجمالي التنزيلات</div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="font-bold text-2xl text-zinc-900">{downloadStats.android}</div>
          <div className="text-xs text-zinc-500 mt-0.5">Android</div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-zinc-600" />
            </div>
          </div>
          <div className="font-bold text-2xl text-zinc-900">{downloadStats.ios}</div>
          <div className="text-xs text-zinc-500 mt-0.5">iOS (PWA)</div>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="font-bold text-2xl text-zinc-900">{downloadStats.today}</div>
          <div className="text-xs text-zinc-500 mt-0.5">اليوم</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 p-6">
        <h3 className="font-cairo font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-brand" /> آخر التنزيلات
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-zinc-600">
              <tr>
                <th className="text-right p-3 font-semibold">الجهاز</th>
                <th className="text-right p-3 font-semibold">IP</th>
                <th className="text-right p-3 font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentDownloads?.length ? stats.recentDownloads.map((d, i) => (
                <tr key={d._id || i} className="border-t border-zinc-100 hover:bg-zinc-50">
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      d.device === 'android' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      {d.device === 'android' ? '📱' : '🍎'} {d.device === 'android' ? 'Android' : 'iOS'}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-xs" dir="ltr">{d.ip || '—'}</td>
                  <td className="p-3 text-xs text-zinc-400">{new Date(d.createdAt).toLocaleDateString('ar-EG')}</td>
                </tr>
              )) : (
                <tr><td colSpan={3} className="p-6 text-center text-zinc-400">لا توجد تنزيلات حتى الآن</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
