import { useState, useEffect } from 'react'
import { Star, MessageSquare } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function ReviewList({ productId }) {
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchReviews = () => {
    fetch(`${API}/reviews/product/${productId}`)
      .then(r => r.json())
      .then(d => {
        setReviews(d.data || [])
        setStats(d.stats || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchReviews() }, [productId])

  if (loading) return null

  return (
    <div className="space-y-4" style={{ direction: 'rtl' }}>
      <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[#237C3C]" />
          <span className="text-sm font-bold text-gray-800">التقييمات</span>
        </div>
        {stats && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-bold text-gray-800">{stats.average.toFixed(1)}</span>
            <span>({stats.total})</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">لا توجد تقييمات بعد. كن أول من يقيم!</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {reviews.map(review => (
            <div key={review.id} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                  <span className="text-xs font-bold text-[#237C3C]">
                    {review.userId?.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400 mr-auto">
                  {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-600 mr-9">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
