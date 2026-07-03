import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Loader2 } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/testimonials`)
      .then(r => r.json())
      .then(data => { setTestimonials(data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-[#f9fafb]">
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin" /></div>
      </section>
    )
  }

  if (testimonials.length === 0) return null

  return (
    <section className="py-16 md:py-20 bg-[#f9fafb]">
      <div className="max-w-[1320px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-cairo text-2xl md:text-3xl font-extrabold text-[#1f2937] mb-2">ماذا يقول عملاؤنا</h2>
          <p className="text-[#6b7280] text-sm">آراء حقيقية من ناس زيك</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              className="bg-white rounded-2xl border border-[#e5e7eb] p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className={`w-4 h-4 ${j < t.rating ? 'text-[#f59e0b] fill-[#f59e0b]' : 'text-[#e5e7eb]'}`} />
                ))}
              </div>
              <p className="text-[#6b7280] text-sm leading-relaxed mb-5">{t.text}</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar || 'https://i.pravatar.cc/100?img=' + i} alt={t.name} className="w-9 h-9 rounded-full object-cover" />
                <p className="text-[#1f2937] font-bold text-sm">{t.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
