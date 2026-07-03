import { useEffect, useRef, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import { UserPlus, X } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch { /* silent */ }
}

export default function NewUserAlert({ onNewUser }) {
  const [toast, setToast] = useState(null)
  const socketRef = useRef(null)
  const timerRef = useRef(null)
  const lastCheckRef = useRef(new Date().toISOString())
  const knownIdsRef = useRef(new Set())

  const showToast = useCallback((user) => {
    if (knownIdsRef.current.has(user._id)) return
    knownIdsRef.current.add(user._id)
    playNotificationSound()
    setToast(user)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setToast(null), 5000)
    if (onNewUser) onNewUser(user)
  }, [onNewUser])

  // Socket.io
  useEffect(() => {
    const s = io(API, { transports: ['websocket', 'polling'], reconnectionAttempts: 3 })
    socketRef.current = s
    s.on('new_user_registered', (user) => showToast(user))
    s.on('connect_error', () => { /* polling fallback handles it */ })
    return () => s.disconnect()
  }, [showToast])

  // Polling fallback for Vercel serverless
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API}/users/latest?since=${lastCheckRef.current}`, {
          credentials: 'include',
        })
        if (!res.ok) return
        const data = await res.json()
        if (data.data?.length) {
          lastCheckRef.current = new Date().toISOString()
          data.data.forEach(u => showToast(u))
        }
      } catch { /* silent */ }
    }

    const interval = setInterval(poll, 15000)
    return () => clearInterval(interval)
  }, [showToast])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  if (!toast) return null

  return (
    <div className="fixed bottom-6 left-6 z-[60] animate-slide-up">
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-xl p-4 flex items-center gap-3 max-w-[360px]">
        <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center shrink-0">
          <UserPlus className="w-5 h-5 text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-zinc-900">عميل جديد!</p>
          <p className="text-xs text-zinc-500 truncate">{toast.name} • {toast.phone || '—'}</p>
        </div>
        <button onClick={() => setToast(null)} className="p-1 hover:bg-zinc-100 rounded-lg cursor-pointer">
          <X className="w-4 h-4 text-zinc-400" />
        </button>
      </div>
    </div>
  )
}
