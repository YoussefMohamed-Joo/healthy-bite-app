import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'
import {
  MessageCircle, Send, Search, Check, CheckCheck, Phone, Mail,
  Clock, ChevronLeft, Loader2, X, User, CheckCircle2, RefreshCw,
  Inbox,
} from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

function formatTime(date) {
  const d = new Date(date)
  return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
}

function formatRelative(date) {
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  if (diff < 60000) return 'الآن'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} د`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} س`
  return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
}

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
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  } catch { /* silent */ }
}

export default function AdminChats() {
  const [chats, setChats] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState({})
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('active')
  const messagesEndRef = useRef(null)
  const socketRef = useRef(null)
  const typingTimerRef = useRef(null)
  const pollRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])

  // Socket connection
  useEffect(() => {
    const socket = io(API, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => socket.emit('join-admin'))

    socket.on('chat:message', (msg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === msg._id)) return prev
        return [...prev, msg]
      })
      setChats(prev => prev.map(c =>
        c._id === msg.chat
          ? { ...c, lastMessage: msg.text || '🖼 صورة', lastMessageAt: new Date().toISOString(), unreadAdmin: c.unreadAdmin + (selected?._id !== msg.chat ? 1 : 0) }
          : c
      ))
      if (selected?._id !== msg.chat) playNotificationSound()
      scrollToBottom()
    })

    socket.on('chat:typing', (data) => {
      setTyping(prev => ({ ...prev, [data.chatId]: data.isTyping }))
    })

    return () => socket.disconnect()
  }, [selected, scrollToBottom])

  // Fetch chats
  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/chat?status=${tab}`, { credentials: 'include' })
      const data = await res.json()
      if (data.data) {
        setChats(data.data.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)))
      }
    } catch { /* silent */ }
    setLoading(false)
  }, [tab])

  useEffect(() => {
    fetchChats()
    const interval = setInterval(fetchChats, 10000)
    pollRef.current = interval
    return () => clearInterval(interval)
  }, [fetchChats])

  // Fetch messages when selecting a chat
  useEffect(() => {
    if (!selected) return
    setMessages([])

    socketRef.current?.emit('chat:join', selected._id)

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${API}/chat/${selected._id}/messages`, { credentials: 'include' })
        const data = await res.json()
        if (data.data) {
          setMessages(data.data)
          scrollToBottom()
        }
      } catch { /* silent */ }
    }

    fetchMessages()

    // Mark as read
    fetch(`${API}/chat/${selected._id}/read`, {
      method: 'PATCH',
      credentials: 'include',
    }).catch(() => {})

    setChats(prev => prev.map(c =>
      c._id === selected._id ? { ...c, unreadAdmin: 0 } : c
    ))

    return () => {
      if (selected?._id) socketRef.current?.emit('chat:leave', selected._id)
    }
  }, [selected?._id, scrollToBottom])

  // Scroll when messages change
  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const sendMessage = async () => {
    if (!text.trim() || !selected || sending) return
    setSending(true)
    const msgText = text.trim()
    setText('')

    try {
      const res = await fetch(`${API}/chat/${selected._id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: msgText }),
      })
      const data = await res.json()
      if (data.data) {
        setMessages(prev => [...prev, data.data])
        setChats(prev => prev.map(c =>
          c._id === selected._id
            ? { ...c, lastMessage: msgText, lastMessageAt: new Date().toISOString() }
            : c
        ))
        scrollToBottom()
      }
    } catch { /* silent */ }
    setSending(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTyping = () => {
    if (!selected) return
    socketRef.current?.emit('chat:typing', { chatId: selected._id, userId: 'admin', isTyping: true })
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit('chat:typing', { chatId: selected._id, userId: 'admin', isTyping: false })
    }, 1500)
  }

  const resolveChat = async (id) => {
    await fetch(`${API}/chat/${id}/resolve`, {
      method: 'PATCH',
      credentials: 'include',
    })
    setChats(prev => prev.filter(c => c._id !== id))
    if (selected?._id === id) setSelected(null)
  }

  const reopenChat = async (id) => {
    await fetch(`${API}/chat/${id}/reopen`, {
      method: 'PATCH',
      credentials: 'include',
    })
    setTab('active')
    fetchChats()
  }

  const filtered = chats.filter(c =>
    c.user?.name?.includes(search) || c.user?.phone?.includes(search) || c.lastMessage?.includes(search)
  )

  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[500px]">
      {/* Left: Chat list */}
      <div className={`w-full md:w-[340px] border-l border-gray-200 bg-white rounded-r-2xl flex flex-col ${selected ? 'hidden md:flex' : 'flex'}`}>
        {/* Tabs */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن عميل..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-grey-light border border-gray-200 text-sm text-charcoal placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTab('active')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer border-none ${
                tab === 'active' ? 'bg-primary text-white shadow-md' : 'bg-grey-light text-grey hover:text-charcoal'
              }`}
            >
              نشطة
              {chats.filter(c => c.unreadAdmin > 0).length > 0 && tab === 'active' && (
                <span className="mr-1.5 w-5 h-5 rounded-full bg-white text-primary text-[10px] font-bold inline-flex items-center justify-center">
                  {chats.filter(c => c.unreadAdmin > 0).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('resolved')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer border-none ${
                tab === 'resolved' ? 'bg-primary text-white shadow-md' : 'bg-grey-light text-grey hover:text-charcoal'
              }`}
            >
              مغلقة
            </button>
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <Inbox className="w-10 h-10 text-grey/50 mb-2" />
              <p className="text-grey text-sm">
                {tab === 'active' ? 'لا توجد محادثات نشطة' : 'لا توجد محادثات مغلقة'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              <AnimatePresence>
                {filtered.map(chat => (
                  <motion.button
                    key={chat._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => setSelected(chat)}
                    className={`w-full text-right px-4 py-3.5 transition-all cursor-pointer border-none bg-none ${
                      selected?._id === chat._id
                        ? 'bg-primary/5'
                        : 'hover:bg-grey-light'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-sm text-charcoal truncate">
                            {chat.user?.name || 'عميل'}
                          </span>
                          <span className="text-[10px] text-grey shrink-0">
                            {formatRelative(chat.lastMessageAt)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-grey truncate block max-w-[180px] text-right">
                            {chat.lastMessage || 'بدون رسائل'}
                          </span>
                          {chat.unreadAdmin > 0 && (
                            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                              {chat.unreadAdmin > 9 ? '9+' : chat.unreadAdmin}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Right: Chat window */}
      <div className={`flex-1 flex flex-col bg-white rounded-l-2xl ${selected ? 'flex' : 'hidden md:flex'}`}>
        {selected ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="md:hidden p-1 rounded-lg hover:bg-grey-light cursor-pointer bg-none border-none"
                >
                  <ChevronLeft className="w-5 h-5 text-charcoal" />
                </button>
                <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm text-charcoal">{selected.user?.name || 'عميل'}</p>
                  <p className="text-[11px] text-grey">
                    {typing[selected._id] ? 'يكتب...' : 'متصل'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selected.user?.phone && (
                  <a href={`tel:${selected.user.phone}`} className="w-8 h-8 rounded-lg hover:bg-grey-light flex items-center justify-center transition-colors">
                    <Phone className="w-4 h-4 text-primary" />
                  </a>
                )}
                {selected.user?.email && (
                  <a href={`mailto:${selected.user.email}`} className="w-8 h-8 rounded-lg hover:bg-grey-light flex items-center justify-center transition-colors">
                    <Mail className="w-4 h-4 text-primary" />
                  </a>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto bg-grey-light p-5 space-y-3">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mb-3">
                    <MessageCircle className="w-7 h-7 text-primary" />
                  </div>
                  <p className="font-bold text-charcoal text-sm mb-1">بداية محادثة جديدة</p>
                  <p className="text-grey text-xs">أرسل أول رسالة للرد على العميل</p>
                </div>
              )}

              {messages.map((msg, i) => {
                const isAdmin = msg.sender === 'admin'
                const prev = messages[i - 1]
                const showDate = !prev || new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString()

                return (
                  <div key={msg._id}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="text-[10px] text-grey bg-white px-3 py-1 rounded-full shadow-sm">
                          {new Date(msg.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isAdmin
                            ? 'bg-primary text-white rounded-tr-sm'
                            : 'bg-white text-charcoal rounded-tl-sm shadow-sm'
                        }`}
                      >
                        {msg.type === 'image' && msg.image && (
                          <img src={msg.image} alt="" className="rounded-lg max-w-full mb-1" />
                        )}
                        {msg.text && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                        )}
                        <div className={`flex items-center gap-1 mt-1 ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                          <span className={`text-[10px] ${isAdmin ? 'text-white/60' : 'text-grey'}`}>
                            {formatTime(msg.createdAt)}
                          </span>
                          {!isAdmin && (
                            msg.read
                              ? <CheckCheck className="w-3 h-3 text-blue-500" />
                              : <Check className="w-3 h-3 text-grey" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )
              })}

              {typing[selected._id] && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-grey/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-grey/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-grey/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={text}
                    onChange={(e) => { setText(e.target.value); handleTyping() }}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب ردك..."
                    rows={1}
                    className="w-full resize-none rounded-xl bg-grey-light border border-gray-200 px-4 py-2.5 text-sm text-charcoal placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    style={{ minHeight: '42px', maxHeight: '120px' }}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => resolveChat(selected._id)}
                    className="w-[42px] h-[42px] rounded-xl bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-all cursor-pointer border-none"
                    title="إنهاء المحادثة"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!text.trim() || sending}
                    className="w-[42px] h-[42px] rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none shadow-md shadow-primary/20"
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <p className="font-bold text-lg text-charcoal mb-1">المحادثات</p>
            <p className="text-grey text-sm">اختر محادثة من القائمة للبدء</p>
          </div>
        )}
      </div>
    </div>
  )
}
