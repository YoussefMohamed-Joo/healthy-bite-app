import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || ''

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/plans`)
      .then(r => r.json())
      .then(data => { setPlans(data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-white">
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin" /></div>
      </section>
    )
  }

  if (plans.length === 0) return null

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-[1320px] mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="font-cairo text-2xl md:text-3xl font-extrabold text-[#1f2937] mb-2">خطط الاشتراك الشهري</h2>
          <p className="text-[#6b7280] text-sm">اختر الخطة المناسبة لأهدافك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative bg-white rounded-3xl border-2 p-6 md:p-7 flex flex-col ${
                plan.popular ? 'border-[#2E7D32] scale-[1.02] md:scale-[1.05] ring-2 ring-[#2E7D32]/20' : 'border-[#e5e7eb]'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#2E7D32] text-white text-[10px] font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  الأكثر طلباً
                </div>
              )}

              <div className="mb-1">
                <span className="text-xs font-semibold text-[#2E7D32] uppercase tracking-wide">{plan.name}</span>
                <h3 className="font-cairo text-xl font-extrabold text-[#1f2937] mt-0.5">{plan.nameAr}</h3>
              </div>
              <p className="text-[#6b7280] text-sm mb-4">{plan.descriptionAr || plan.description}</p>

              <div className="mb-5">
                <span className="text-3xl font-extrabold text-[#1f2937]">{plan.price}</span>
                <span className="text-[#6b7280] text-sm mr-1">جنية/شهر</span>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features?.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-[#1f2937]">
                    <Check className="w-4 h-4 text-[#2E7D32] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/plans"
                className={`w-full text-center font-bold text-sm py-3 rounded-full transition-all duration-200 border-2 block no-underline ${
                  plan.popular
                    ? 'bg-[#2E7D32] text-white border-[#2E7D32] hover:bg-[#1b5e20] shadow-md shadow-[#2E7D32]/20'
                    : 'bg-transparent text-[#1f2937] border-[#e5e7eb] hover:border-[#2E7D32]'
                }`}
              >
                {plan.popular ? 'اشترك الآن' : 'اعرف أكثر'}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
