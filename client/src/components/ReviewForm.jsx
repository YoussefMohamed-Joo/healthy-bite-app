import { useState } from 'react'
import { Star } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function ReviewForm({ productId, onReviewAdded }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) return
    setSending(true)
    try {
      const res = await fetch(`${API}/reviews`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, rating, comment }),
      })
      if (res.ok) {
        setRating(0)
        setComment('')
        onReviewAdded?.()
      }
    } catch { /* ignore */ }
    setSending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3" style={{ direction: 'rtl' }}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 cursor-pointer bg-none border-none"
          >
            <Star
              className={`w-5 h-5 transition-colors ${
                (hover || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        {rating > 0 && <span className="text-xs text-gray-500 mr-2">({rating}/5)</span>}
      </div>
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="أضف تعليقك (اختياري)"
        rows={2}
        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#237C3C]/30 transition-all"
      />
      <button
        type="submit"
        disabled={rating === 0 || sending}
        className="px-4 py-2 bg-[#237C3C] text-white rounded-xl text-sm font-bold hover:bg-[#1A5E2E] disabled:opacity-50 transition-colors cursor-pointer"
      >
        {sending ? 'جاري...' : 'إرسال التقييم'}
      </button>
    </form>
  )
}
