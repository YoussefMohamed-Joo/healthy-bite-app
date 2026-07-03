import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Leaf, Sparkles, Shield, Heart, Loader2 } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

const iconMap = { Leaf, Sparkles, Shield, Heart }

export default function About() {
  const [values, setValues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/settings?keys=about_values`)
      .then(r => r.json())
      .then(d => { setValues(d.data?.about_values || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <section className="min-h-screen bg-white pt-[70px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
    </section>
  )

  return (
    <section className="min-h-screen bg-white pt-[70px]">
      <div className="bg-gradient-to-br from-brand/5 to-white">
        <div className="max-w-[1320px] mx-auto px-6 py-16 md:py-20 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-cairo text-3xl md:text-4xl font-extrabold text-zinc-900 mb-4">
            حكاية Healthy<span className="text-brand">Bite</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="text-zinc-500 max-w-2xl mx-auto text-base leading-relaxed">
            بدأنا في ٢٠٢٢ بحلم بسيط: نغير شكل الأكل الصحي في مصر. مش مجرد وجبات — أسلوب حياة.
          </motion.p>
        </div>
      </div>

      <div className="max-w-[1320px] mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-10 items-center mb-20">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="font-cairo text-2xl font-extrabold text-zinc-900 mb-4">إيه اللي بنقدمه؟</h2>
            <div className="space-y-3 text-zinc-600 text-sm leading-relaxed">
              <p>HealthyBite منصة توصيل وجبات صحية في مصر. بنوصل وجبات طازة، محسوبة السعرات، وطعمها جامد — لباب بيتك.</p>
              <p>بنستخدم مكونات طبيعية من مزارع محلية، وكل وجبة بتتصمم بالتعاون مع أخصائي تغذية عشان تضمن إنك بتاخد احتياجك بالظبط.</p>
              <p>أكثر من ٥٠٠+ عميل سعيد، وبنوصل لكل مناطق بني سويف. ولسه بنكبر!</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="h-[350px] rounded-3xl overflow-hidden">
            <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=700&q=85" alt="Kitchen" className="w-full h-full object-cover" />
          </motion.div>
        </div>

        <h2 className="font-cairo text-2xl font-extrabold text-zinc-900 text-center mb-8">قيمنا</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {values.map((v, i) => {
            const Icon = iconMap[v.icon] || Leaf
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-zinc-50 rounded-2xl p-6 text-center hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-light flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-brand" />
                </div>
                <h3 className="font-cairo font-bold text-zinc-900 mb-2">{v.title}</h3>
                <p className="text-zinc-500 text-sm">{v.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
