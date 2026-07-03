import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.message || 'حدث خطأ')
      setSent(true)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <>
      <Helmet>
        <title>استعادة كلمة المرور | Helthy Bite</title>
      </Helmet>
      <div className="min-h-[80vh] flex items-center justify-center bg-[#F8F9F8] p-6" style={{ direction: 'rtl' }}>
        <div className="w-full max-w-md">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-[#666666] hover:text-[#237C3C] transition-colors mb-8 no-underline">
            <ArrowLeft className="w-4 h-4" />
            العودة لتسجيل الدخول
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {sent ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#237C3C]" />
                </div>
                <h1 className="text-xl font-bold text-[#1A1A1A] mb-3">تم إرسال رابط الاستعادة</h1>
                <p className="text-sm text-[#666666] leading-relaxed mb-6">
                  لو الإيميل ده مسجل عندنا، هتوصلك رسالة فيها رابط استعادة كلمة المرور.
                </p>
                <Link
                  to="/login"
                  className="text-sm text-[#237C3C] font-bold hover:underline no-underline"
                >
                  العودة لتسجيل الدخول
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">استعادة كلمة المرور</h1>
                <p className="text-sm text-[#666666] mb-6">هتبعتلك رسالة على الإيميل عشان تستعيد كلمة السر.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">الإيميل</label>
                    <div className="relative">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        required
                        className="w-full pr-12 pl-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#237C3C]/30 focus:border-[#237C3C] transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full py-3 bg-[#237C3C] text-white rounded-xl text-sm font-bold hover:bg-[#1A5E2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    إرسال رابط الاستعادة
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
