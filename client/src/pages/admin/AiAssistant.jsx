import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader2, Sparkles, AlertCircle } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'مرحباً! أنا مساعد Helthy Bite الذكي. اسألني أي شيء عن الموقع، الطلبات، أو التغذية.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userMsg.content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'عذراً، حدث خطأ. حاول مرة أخرى.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-brand" />
        <h1 className="text-lg font-bold">المساعد الذكي</h1>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-4 bg-white rounded-xl border border-zinc-100">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-brand" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand text-white rounded-bl-sm'
                  : 'bg-zinc-50 text-zinc-800 rounded-br-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-brand" />
            </div>
            <div className="bg-zinc-50 rounded-2xl rounded-br-sm px-4 py-2.5">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="اسأل أي شيء..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm outline-none focus:border-brand transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2.5 rounded-xl bg-brand text-white hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
