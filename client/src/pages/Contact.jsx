import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, Send, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const API = import.meta.env.VITE_API_URL || ''

const iconMap = { Phone, Mail, MapPin, Clock }

export default function Contact() {
  const [contactInfo, setContactInfo] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`${API}/settings?keys=contact_info`)
      .then(r => r.json())
      .then(d => { setContactInfo(d.data?.contact_info || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      const res = await fetch(`${API}/contact/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'حدث خطأ')
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  if (loading) return (
    <section className="min-h-screen bg-zinc-50 pt-[70px] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
    </section>
  )

  return (
    <>
      <Helmet>
        <title>تواصل معنا — Helthy Bite</title>
        <meta name="description" content="عندك سؤال أو اقتراح؟ تواصل مع فريق Helthy Bite. احنا هنا عشان نساعدك." />
        <meta property="og:title" content="تواصل معنا — Helthy Bite" />
        <meta property="og:description" content="عندك سؤال أو اقتراح؟ تواصل مع فريق Helthy Bite." />
        <meta property="og:image" content="https://helthybite.vercel.app/og-image.svg" />
        <meta property="og:url" content="https://helthybite.vercel.app/contact" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://helthybite.vercel.app/contact" />
      </Helmet>
      <section className="min-h-screen bg-zinc-50 pt-[70px]">
        <div className="max-w-[1320px] mx-auto px-6 py-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <h1 className="font-cairo text-3xl md:text-4xl font-extrabold text-zinc-900 mb-3">تواصل معنا</h1>
            <p className="text-zinc-500 max-w-xl mx-auto">عندك سؤال أو اقتراح أو عايز تطلب؟ احنا هنا عشان نساعدك</p>
          </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-[1000px] mx-auto">
          <div className="space-y-4">
            {contactInfo.map((info, i) => {
              const Icon = iconMap[info.icon] || Mail
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.08 } }}
                  className="bg-white rounded-2xl border border-zinc-100 p-5 flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <h4 className="font-cairo font-bold text-sm text-zinc-900">{info.label}</h4>
                    <p className="text-zinc-600 text-sm">{info.value}</p>
                    <p className="text-zinc-400 text-xs">{info.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}>
            {sent ? (
              <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center h-full flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center mb-4">
                  <Send className="w-6 h-6 text-brand" />
                </div>
                <h3 className="font-cairo font-bold text-lg text-zinc-900 mb-1">تم إرسال رسالتك!</h3>
                <p className="text-zinc-500 text-sm">هنتواصل معاك في أقرب وقت</p>
              </div>
            ) : (
              <form onSubmit={submit} className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-4 h-full">
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">الاسم</label>
                  <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="اسمك بالكامل" className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">البريد الإلكتروني</label>
                  <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="example@email.com" className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">الرسالة</label>
                  <textarea required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} placeholder="اكتب رسالتك هنا..." rows={5} className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={sending}>
                  {sending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
      </section>
    </>
  )
}
