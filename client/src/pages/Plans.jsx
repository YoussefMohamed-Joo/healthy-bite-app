import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Sparkles, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const API = import.meta.env.VITE_API_URL || ''

export default function Plans() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/plans`)
      .then(r => r.json())
      .then(d => { setPlans(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <section className="min-h-screen bg-zinc-50 pt-[70px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
    </section>
  )

  return (
    <>
      <Helmet>
        <title>خطط الاشتراك الشهري — Helthy Bite</title>
        <meta name="description" content="اشترك في خطة وجبات صحية شهرية من Helthy Bite. اختر الخطة اللي تناسب أهدافك. توصيل مجاني — إلغاء أو تعديل أي وقت." />
        <meta property="og:title" content="خطط الاشتراك الشهري — Helthy Bite" />
        <meta property="og:description" content="اشترك في خطة وجبات صحية شهرية من Helthy Bite. اختر الخطة اللي تناسب أهدافك." />
        <meta property="og:image" content="https://helthybite.vercel.app/og-image.svg" />
        <meta property="og:url" content="https://helthybite.vercel.app/plans" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://helthybite.vercel.app/plans" />
      </Helmet>
      <section className="min-h-screen bg-zinc-50 pt-[70px]">
        <div className="max-w-[1320px] mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-cairo text-3xl md:text-4xl font-extrabold text-zinc-900 mb-3">خطط الاشتراك الشهري</h1>
            <p className="text-zinc-500 max-w-xl mx-auto">اختر الخطة اللي تناسب أهدافك، وكلها تشمل توصيل مجاني — ألغي أو عدل أي وقت</p>
          </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1100px] mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }}
              className={`relative bg-white rounded-3xl border-2 p-7 flex flex-col ${
                plan.popular ? 'border-brand scale-[1.02] md:scale-[1.05] ring-2 ring-brand/20' : 'border-zinc-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand text-white text-[10px] font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  الأكثر طلباً
                </div>
              )}

              <div className="mb-2">
                <span className="text-xs font-semibold text-brand uppercase tracking-wide">{plan.name}</span>
                <h3 className="font-cairo text-xl font-extrabold text-zinc-900 mt-0.5">{plan.nameAr}</h3>
              </div>
              <p className="text-zinc-500 text-sm mb-4">{plan.descriptionAr || plan.description}</p>

              <div className="mb-6">
                <span className="text-3xl font-extrabold text-zinc-900">{plan.price}</span>
                <span className="text-zinc-500 text-sm mr-1">جنية/شهر</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features?.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-700">
                    <Check className="w-4 h-4 text-brand shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button className={plan.popular ? '' : 'bg-white text-zinc-900 border-2 border-zinc-200 hover:border-brand hover:text-brand shadow-none'} variant={plan.popular ? 'default' : 'ghost'} size="lg">
                {plan.popular ? 'ابدأ الاشتراك' : 'اختر الخطة'}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6 } }} className="text-center mt-12">
          <p className="text-zinc-500 text-sm mb-4">عندك استفسار؟ تواصل معنا</p>
          <Link to="/contact">
            <Button variant="outline" className="border-brand text-brand hover:bg-brand hover:text-white">اتصل بنا</Button>
          </Link>
        </motion.div>
      </div>
      </section>
    </>
  )
}
