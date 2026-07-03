import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { io } from 'socket.io-client'
import { Package, CheckCircle, X } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

const statusMessages = {
  confirmed: 'تم تأكيد طلبك',
  preparing: 'طلبك قيد التحضير',
  delivering: 'طلبك خرج للتوصيل',
  delivered: 'تم توصيل طلبك 🎉',
  cancelled: 'تم إلغاء طلبك',
  rejected: 'لم يتم تأكيد دفع طلبك',
}

export default function OrderNotification() {
  const { user } = useAuth()
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!user || user.role === 'admin') return
    const socket = io(API, { transports: ['websocket', 'polling'] })

    socket.on('order-status-update', (data) => {
      const msg = statusMessages[data.order?.status]
      if (msg) {
        setToast({ message: msg, orderId: data.order?._id })
        setTimeout(() => setToast(null), 5000)
      }
    })

    return () => socket.disconnect()
  }, [user])

  if (!toast) return null

  return (
    <div className="fixed bottom-6 left-6 z-[100] animate-slide-up">
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-xl p-4 flex items-center gap-3 min-w-[280px]">
        <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center shrink-0">
          <Package className="w-5 h-5 text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900">{toast.message}</p>
          <p className="text-xs text-zinc-400">طلب #{toast.orderId?.slice(-6)}</p>
        </div>
        <button onClick={() => setToast(null)} className="p-1 hover:bg-zinc-100 rounded-lg cursor-pointer shrink-0">
          <X className="w-4 h-4 text-zinc-400" />
        </button>
      </div>
    </div>
  )
}
