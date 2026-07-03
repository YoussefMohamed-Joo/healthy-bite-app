import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Loader2 } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function FAQ() {
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [openIndex, setOpenIndex] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch(`${API}/faq`)
      .then(r => r.json())
      .then(d => { setFaqs(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = faqs.filter(f =>
    f.question.includes(search) || f.answer.includes(search)
  )

  if (loading) return (
    <section className="min-h-screen bg-zinc-50 pt-[70px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
    </section>
  )

  return (
    <section className="min-h-screen bg-zinc-50 pt-[70px]">
      <div className="max-w-[800px] mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h1 className="font-cairo text-3xl md:text-4xl font-bold text-zinc-900 mb-3">الأسئلة الشائعة</h1>
          <p className="text-zinc-500 text-base">كل ما تحتاج معرفته عن توصيل الوجبات الصحية في مصر.</p>
        </div>

        <div className="relative mb-10">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في الأسئلة..."
            className="w-full pr-12 pl-4 py-3.5 rounded-2xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 shadow-sm"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((faq, i) => (
            <motion.div
              key={faq._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.02 } }}
              className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-right cursor-pointer"
              >
                <span className="font-cairo font-bold text-zinc-900 text-sm md:text-base leading-relaxed ml-4">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-zinc-600 text-sm leading-relaxed border-t border-zinc-50 pt-3">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-zinc-400">
            <p className="text-lg">مفيش نتائج لبحثك</p>
          </div>
        )}
      </div>
    </section>
  )
}
