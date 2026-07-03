import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password || password.length < 6) {
      setError('كلمة المرور لا تقل عن 6 أحرف')
      return
    }
    if (password !== confirm) {
      setError('كلمة المرور غير متطابقة')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.message || 'حدث خطأ')
      setDone(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  if (!token) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-[#F8F9F8] p-6" style={{ direction: 'rtl' }}>
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">رابط غير صالح</h1>
          <p className="text-sm text-[#666666] mb-6">رابط استعادة كلمة المرور غير صالح أو منتهي.</p>
          <Link to="/forgot-password" className="text-[#237C3C] font-bold text-sm hover:underline no-underline">
            طلب رابط جديد
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>تعيين كلمة مرور جديدة | Helthy Bite</title>
      </Helmet>
      <div className="min-h-[80vh] flex items-center justify-center bg-[#F8F9F8] p-6" style={{ direction: 'rtl' }}>
        <div className="w-full max-w-md">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-[#666666] hover:text-[#237C3C] transition-colors mb-8 no-underline">
            <ArrowLeft className="w-4 h-4" />
            العودة لتسجيل الدخول
          </Link>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {done ? (
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-[#237C3C]" />
                </div>
                <h1 className="text-xl font-bold text-[#1A1A1A] mb-3">تم تغيير كلمة المرور</h1>
                <p className="text-sm text-[#666666]">جاري تحويلك لتسجيل الدخول...</p>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">كلمة مرور جديدة</h1>
                <p className="text-sm text-[#666666] mb-6">أدخل كلمة المرور الجديدة.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">كلمة المرور الجديدة</label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                      <input
                        type={show ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="أقل من 6 أحرف"
                        required
                        className="w-full pr-12 pl-10 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#237C3C]/30 focus:border-[#237C3C] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShow(p => !p)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#1A1A1A] cursor-pointer"
                      >
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1A1A1A] mb-2">تأكيد كلمة المرور</label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666666]" />
                      <input
                        type={show ? 'text' : 'password'}
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        placeholder="أعد كتابة كلمة المرور"
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
                    disabled={loading || !password || !confirm}
                    className="w-full py-3 bg-[#237C3C] text-white rounded-xl text-sm font-bold hover:bg-[#1A5E2E] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    تغيير كلمة المرور
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
