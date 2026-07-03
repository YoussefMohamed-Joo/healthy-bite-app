import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/utils/supabase'
import { playMessageSound, requestNotificationPermission } from '@/utils/playMessageSound'
import { MessageCircle, Send, CheckCircle2, RotateCcw, Loader2, Smartphone, Monitor } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function AdminChats() {
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [tab, setTab] = useState('active')
  const bottomRef = useRef(null)

  useEffect(() => { requestNotificationPermission() }, [])

  useEffect(() => {
    fetchConversations()
  }, [tab])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Subscribe to ALL new messages for admin
  useEffect(() => {
    const channel = supabase
      .channel('admin:messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new
          // If currently viewing this conversation, append
          if (activeConv && msg.conversation_id === activeConv.id) {
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev
              return [...prev, msg]
            })
          }
          // Refresh conversation list
          setConversations(prev => {
            const existing = prev.find(c => c.id === msg.conversation_id)
            if (existing) {
              return prev.map(c =>
                c.id === msg.conversation_id
                  ? { ...c, lastMessage: msg, updated_at: msg.created_at }
                  : c
              ).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            }
            return prev
          })
          // Notify
          if (msg.sender_role === 'user') {
            playMessageSound()
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('💬 رسالة جديدة', {
                body: msg.content?.slice(0, 80),
                icon: '/favicon.ico',
              })
            }
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeConv])

  const fetchConversations = async () => {
    const res = await fetch(`${API}/chat?status=${tab}`, { credentials: 'include' })
    const d = await res.json()
    setConversations(d.data || [])
  }

  const selectConversation = async (conv) => {
    setActiveConv(conv)
    const res = await fetch(`${API}/chat/${conv.id}/messages`, { credentials: 'include' })
    const d = await res.json()
    setMessages(d.data || [])
  }

  const sendMessage = async () => {
    if (!text.trim() || !activeConv || sending) return
    setSending(true)
    try {
      await fetch(`${API}/chat/${activeConv.id}/message`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim() }),
      })
      setText('')
    } catch { /* ignore */ }
    setSending(false)
  }

  const handleResolve = async () => {
    if (!activeConv) return
    await fetch(`${API}/chat/${activeConv.id}/resolve`, { method: 'PATCH', credentials: 'include' })
    setActiveConv(null)
    setMessages([])
    fetchConversations()
  }

  const handleReopen = async (conv) => {
    await fetch(`${API}/chat/${conv.id}/reopen`, { method: 'PATCH', credentials: 'include' })
    fetchConversations()
  }

  const formatTime = (t) => {
    if (!t) return ''
    const d = new Date(t)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return 'الآن'
    if (diff < 3600000) return `منذ ${Math.floor(diff / 60000)} د`
    return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-[calc(100vh-100px)] gap-4" style={{ direction: 'rtl' }}>
      {/* Sidebar */}
      <div className="w-72 shrink-0 bg-white rounded-2xl border border-zinc-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-zinc-100">
          <h2 className="font-bold text-zinc-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-brand" />
            المحادثات
          </h2>
          <div className="flex gap-1 mt-3 bg-zinc-100 rounded-xl p-1">
            <button
              onClick={() => setTab('active')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${tab === 'active' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              نشطة ({conversations.filter(c => c.status === 'active').length})
            </button>
            <button
              onClick={() => setTab('resolved')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${tab === 'resolved' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              مغلقة
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full text-zinc-400 text-sm p-4 text-center">
              لا توجد محادثات {tab === 'active' ? 'نشطة' : 'مغلقة'}
            </div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`w-full text-right px-4 py-3 border-b border-zinc-50 hover:bg-zinc-50 transition-colors cursor-pointer ${activeConv?.id === conv.id ? 'bg-brand-light/30' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-900 truncate">{conv.user_name || conv.user_email || conv.user_id?.slice(0, 8)}</span>
                  <span className="text-[10px] text-zinc-400 shrink-0 mr-2">{formatTime(conv.updated_at)}</span>
                </div>
                <p className="text-xs text-zinc-500 truncate mt-1">
                  {conv.lastMessage ? (
                    <>{conv.lastMessage.sender_role === 'admin' ? 'أنت: ' : ''}{conv.lastMessage.content}</>
                  ) : 'لا توجد رسائل'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {conv.status === 'resolved' && (
                    <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">مغلقة</span>
                  )}
                  {conv.user_email && (
                    <span className="text-[10px] text-zinc-400">{conv.user_email}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-white rounded-2xl border border-zinc-100 flex flex-col overflow-hidden">
        {!activeConv ? (
          <div className="flex-1 flex items-center justify-center text-zinc-400">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">اختر محادثة من القائمة</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <div>
                <p className="text-sm font-bold text-zinc-900">{activeConv.user_name || 'مستخدم'}</p>
                <p className="text-xs text-zinc-500">{activeConv.user_email || ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResolve}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> إنهاء
                </button>
                {activeConv.status === 'resolved' && (
                  <button
                    onClick={() => handleReopen(activeConv)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> إعادة فتح
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-zinc-50">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_role === 'admin' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender_role === 'admin'
                      ? 'bg-brand text-white rounded-br-sm'
                      : 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-sm'
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender_role === 'admin' ? 'text-white/60' : 'text-zinc-400'}`}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-zinc-100 px-5 py-3 bg-white">
              <div className="flex gap-2 items-end">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  placeholder="اكتب ردك..."
                  rows={1}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all"
                  style={{ minHeight: 40, maxHeight: 100 }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!text.trim() || sending}
                  className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
