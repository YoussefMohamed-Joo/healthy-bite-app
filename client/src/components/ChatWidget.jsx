import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

const API = import.meta.env.VITE_API_URL || ''

export default function ChatWidget() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [conv, setConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const convRef = useRef(null)

  useEffect(() => {
    if (!open || !user) return
    initChat()
  }, [open, user])

  useEffect(() => {
    if (!open || !conv) return
    const id = setInterval(async () => {
      try {
        const res = await fetch(`${API}/chat/${convRef.current}/messages`, { credentials: 'include' })
        const d = await res.json()
        setMessages(d.data || [])
      } catch { /* silent */ }
    }, 3000)
    return () => clearInterval(id)
  }, [open, conv])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initChat = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/chat/my`, { credentials: 'include' })
      const d = await res.json()
      if (!d.data) return
      setConv(d.data)
      convRef.current = d.data.id

      const res2 = await fetch(`${API}/chat/${d.data.id}/messages`, { credentials: 'include' })
      const d2 = await res2.json()
      setMessages(d2.data || [])
    } catch { /* ignore */ }
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!text.trim() || !conv || sending) return
    setSending(true)
    const content = text.trim()
    setText('')
    // Optimistic update
    setMessages(prev => [...prev, {
      id: `temp-${Date.now()}`,
      content,
      senderRole: 'user',
      createdAt: new Date().toISOString(),
    }])
    try {
      await fetch(`${API}/chat/${conv.id}/message`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      // Fetch fresh messages
      const res = await fetch(`${API}/chat/${conv.id}/messages`, { credentials: 'include' })
      const d = await res.json()
      setMessages(d.data || [])
    } catch { /* ignore */ }
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      <button
        onClick={() => setOpen(p => !p)}
        className="fixed bottom-6 left-6 z-[9999] w-14 h-14 rounded-full bg-[#237C3C] text-white shadow-lg hover:bg-[#1A5E2E] transition-all cursor-pointer flex items-center justify-center"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 left-6 z-[9999] w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-200px)] bg-white rounded-2xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden" style={{ direction: 'rtl' }}>
          <div className="bg-[#237C3C] text-white px-5 py-4 flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">الدعم الفني</p>
              <p className="text-[11px] text-white/70">نرد خلال دقائق</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-zinc-50">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
              </div>
            ) : !user ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-zinc-400 text-sm">سجل الدخول أولاً عشان تتواصل مع الدعم</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-zinc-400 text-sm">ابدأ المحادثة بإرسال رسالة</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.senderRole === 'admin' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.senderRole === 'admin'
                      ? 'bg-white text-zinc-800 border border-zinc-200 rounded-br-sm'
                      : 'bg-[#237C3C] text-white rounded-bl-sm'
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.senderRole === 'admin' ? 'text-zinc-400' : 'text-white/60'}`}>
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true, locale: ar })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <div className="shrink-0 border-t border-zinc-100 px-4 py-3 bg-white">
            <div className="flex gap-2 items-end">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب رسالتك..."
                rows={1}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#237C3C]/30 focus:border-[#237C3C] transition-all"
                style={{ minHeight: 40, maxHeight: 100 }}
              />
              <button
                onClick={sendMessage}
                disabled={!text.trim() || sending}
                className="w-10 h-10 rounded-xl bg-[#237C3C] text-white flex items-center justify-center hover:bg-[#1A5E2E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
