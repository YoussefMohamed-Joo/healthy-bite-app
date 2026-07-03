import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, ChevronDown, Clock, Check, CheckCheck, Loader2 } from 'lucide-react'
import { io } from 'socket.io-client'
import { useAuth } from '@/context/AuthContext'

const API = import.meta.env.VITE_API_URL || ''

function formatTime(date) {
  const d = new Date(date)
  return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(date) {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'اليوم'
  if (d.toDateString() === yesterday.toDateString()) return 'أمس'
  return d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })
}

function playMessageSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(600, ctx.currentTime)
    osc.frequency.setValueAtTime(900, ctx.currentTime + 0.08)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  } catch { /* silent */ }
}

const statusIcons = {
  sent: Check,
  delivered: CheckCheck,
  read: CheckCheck,
}

export default function ChatWidget() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [chat, setChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const [unread, setUnread] = useState(0)
  const [socketConnected, setSocketConnected] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const socketRef = useRef(null)
  const typingTimerRef = useRef(null)
  const pollingRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])

  // Socket connection
  useEffect(() => {
    if (!user || user.role === 'admin') return
    const socket = io(API, { transports: ['websocket', 'polling'] })
    socketRef.current = socket

    socket.on('connect', () => setSocketConnected(true))
    socket.on('disconnect', () => setSocketConnected(false))

    socket.on('chat:message', (msg) => {
      if (msg.sender === 'admin') {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev
          return [...prev, msg]
        })
        setUnread(prev => prev + 1)
        playMessageSound()
        scrollToBottom()
      }
    })

    socket.on('chat:typing', (data) => {
      if (data.isTyping) setTyping(true)
      else setTyping(false)
    })

    return () => socket.disconnect()
  }, [user, scrollToBottom])

  // Fetch chat on mount + polling fallback
  useEffect(() => {
    if (!user || user.role === 'admin') return

    const fetchChat = async () => {
      try {
        const res = await fetch(`${API}/chat/my`, { credentials: 'include' })
        const data = await res.json()
        if (data.data) {
          setChat(data.data)
          socketRef.current?.emit('chat:join', data.data._id)
          return data.data
        }
      } catch { /* silent */ }
      return null
    }

    const fetchMessages = async (chatId) => {
      try {
        const res = await fetch(`${API}/chat/${chatId}/messages`, { credentials: 'include' })
        const data = await res.json()
        if (data.data) {
          setMessages(data.data)
          scrollToBottom()
        }
      } catch { /* silent */ }
    }

    fetchChat().then(c => { if (c) fetchMessages(c._id) })

    // Polling fallback every 10s
    pollingRef.current = setInterval(async () => {
      const c = await fetchChat()
      if (c) {
        try {
          const res = await fetch(`${API}/chat/${c._id}/messages`, { credentials: 'include' })
          const data = await res.json()
          if (data.data?.length > messages.length) {
            const newMsgs = data.data.filter(m => m.sender === 'admin' && !messages.some(ex => ex._id === m._id))
            if (newMsgs.length > 0) {
              setMessages(data.data)
              setUnread(prev => prev + newMsgs.length)
              playMessageSound()
              scrollToBottom()
            }
          }
        } catch { /* silent */ }
      }
    }, 10000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [user, scrollToBottom])

  // Mark read when opening
  useEffect(() => {
    if (open && chat) {
      fetch(`${API}/chat/${chat._id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      }).catch(() => {})
      setUnread(0)
    }
  }, [open, chat])

  // Scroll when messages change
  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  const sendMessage = async () => {
    if (!text.trim() || !chat || sending) return
    setSending(true)
    const msgText = text.trim()
    setText('')

    try {
      const res = await fetch(`${API}/chat/${chat._id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: msgText }),
      })
      const data = await res.json()
      if (data.data) {
        setMessages(prev => [...prev, data.data])
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
    if (!chat) return
    socketRef.current?.emit('chat:typing', { chatId: chat._id, userId: user?._id, isTyping: true })
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit('chat:typing', { chatId: chat._id, userId: user?._id, isTyping: false })
    }, 1500)
  }

  if (!user || user.role === 'admin') return null

  if (!open) {
    return (
      <div className="fixed bottom-5 left-5 z-[100] flex flex-col items-end gap-3">
        {unread > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setOpen(true)}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-2.5 flex items-center gap-2 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <span className="text-sm font-bold text-charcoal">{unread} رسالة جديدة</span>
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-full bg-primary text-white shadow-xl shadow-primary/40 hover:shadow-2xl hover:shadow-primary/50 transition-all flex items-center justify-center cursor-pointer border-none relative"
        >
          <MessageCircle className="w-6 h-6" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </motion.button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-5 left-5 z-[100] w-[360px] max-w-[calc(100vw-40px)]"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-primary" />
            </div>
            <div>
              <p className="font-bold text-sm">الدعم الفني</p>
              <p className="text-[11px] text-white/70">
                {typing ? 'يكتب...' : socketConnected ? 'متصل' : 'جاري الاتصال...'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimized(!minimized)}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center cursor-pointer bg-none border-none"
            >
              <ChevronDown className={`w-4 h-4 text-white transition-transform ${minimized ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => { setOpen(false); setMinimized(false) }}
              className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center cursor-pointer bg-none border-none"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {!minimized && (
          <>
            {/* Messages */}
            <div className="h-[380px] overflow-y-auto bg-[#F8F9F8] p-4 space-y-3" style={{ scrollBehavior: 'smooth' }}>
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mb-3">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-bold text-charcoal text-sm mb-1">مرحباً بك!</p>
                  <p className="text-grey text-xs max-w-[220px]">
                    اكتب رسالتك وسنرد عليك في أقرب وقت ممكن
                  </p>
                </div>
              )}

              {messages.map((msg, i) => {
                const prev = messages[i - 1]
                const showDate = !prev || new Date(msg.createdAt).toDateString() !== new Date(prev.createdAt).toDateString()
                const isUser = msg.sender === 'user'
                const StatusIcon = statusIcons[msg.status || 'sent']

                return (
                  <div key={msg._id}>
                    {showDate && (
                      <div className="flex justify-center my-3">
                        <span className="text-[10px] text-grey bg-white px-3 py-1 rounded-full shadow-sm">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                          isUser
                            ? 'bg-white text-charcoal rounded-tr-sm shadow-sm'
                            : 'bg-primary text-white rounded-tl-sm'
                        }`}
                      >
                        {msg.type === 'image' && msg.image && (
                          <img src={msg.image} alt="" className="rounded-lg max-w-full mb-1" />
                        )}
                        {msg.text && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                        )}
                        <div className={`flex items-center gap-1 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                          <span className={`text-[10px] ${isUser ? 'text-grey' : 'text-white/60'}`}>
                            {formatTime(msg.createdAt)}
                          </span>
                          {isUser && (
                            <StatusIcon className={`w-3 h-3 ${msg.read ? 'text-blue-500' : 'text-grey'}`} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )
              })}

              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-end"
                >
                  <div className="bg-primary/80 text-white rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-100">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={text}
                    onChange={(e) => { setText(e.target.value); handleTyping() }}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب رسالتك..."
                    rows={1}
                    className="w-full resize-none rounded-xl bg-[#F8F9F8] border border-gray-200 px-4 py-2.5 text-sm text-charcoal placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    style={{ minHeight: '42px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!text.trim() || sending}
                  className="w-[42px] h-[42px] rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none shrink-0 shadow-md shadow-primary/20"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
