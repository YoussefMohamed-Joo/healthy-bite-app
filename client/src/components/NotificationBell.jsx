import { useState, useEffect, useRef } from 'react'
import { Bell, X, CheckCheck, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || ''

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const fetchNotifications = () => {
    fetch(`${API}/notifications`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        setNotifications(d.data || [])
        setUnread(d.unread || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAllRead = async () => {
    await fetch(`${API}/notifications/read-all`, { method: 'PUT', credentials: 'include' })
    setUnread(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const markRead = async (id) => {
    await fetch(`${API}/notifications/${id}/read`, { method: 'PUT', credentials: 'include' })
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(p => !p)}
        className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer bg-none border-none"
      >
        <Bell className="w-[22px] h-[22px] text-gray-800" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-bold text-gray-800">الإشعارات</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-[#237C3C] font-bold hover:underline cursor-pointer bg-none border-none"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                تحديد الكل
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-gray-300" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">لا توجد إشعارات</div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => { if (!n.read) markRead(n.id) }}
                  className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${n.read ? '' : 'bg-[#E8F5E9]/30'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${n.read ? 'text-gray-600' : 'text-gray-900 font-bold'}`}>{n.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpen(false) }}
                      className="p-0.5 text-gray-300 hover:text-gray-500 cursor-pointer bg-none border-none"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-300 mt-1">
                    {new Date(n.createdAt).toLocaleDateString('ar-EG')}
                  </p>
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <Link
              to="/profile?tab=notifications"
              onClick={() => setOpen(false)}
              className="block text-center py-2.5 text-xs font-bold text-[#237C3C] hover:bg-gray-50 border-t border-gray-100 no-underline"
            >
              عرض الكل
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
