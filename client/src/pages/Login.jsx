import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { LogIn } from 'lucide-react'
import WelcomeOverlay from '@/components/WelcomeOverlay'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [userName, setUserName] = useState('')
  const [redirectPath, setRedirectPath] = useState('/')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(form.email, form.password, rememberMe)
      setUserName(data.user?.name || '')
      setRedirectPath(data.user?.role === 'admin' ? '/admin' : '/')
      setShowWelcome(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>تسجيل الدخول — Helthy Bite</title>
        <meta name="description" content="سجل دخولك في Helthy Bite لمتابعة طلباتك والحصول على عروض حصرية." />
        <meta property="og:title" content="تسجيل الدخول — Helthy Bite" />
        <meta property="og:description" content="سجل دخولك في Helthy Bite لمتابعة طلباتك." />
        <meta property="og:image" content="https://helthybite.vercel.app/og-image.svg" />
        <meta property="og:url" content="https://helthybite.vercel.app/login" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://helthybite.vercel.app/login" />
      </Helmet>
      <section className="min-h-screen bg-zinc-50 pt-[70px] flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto px-4 py-6">
          <div className="text-center mb-4">
            <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center mx-auto mb-2">
              <LogIn className="w-5 h-5 text-brand" />
            </div>
            <h1 className="font-cairo text-lg font-bold text-zinc-900">تسجيل الدخول</h1>
            <p className="text-zinc-500 text-[11px]">ادخل بياناتك عشان تتابع طلباتك</p>
          </div>

          <form onSubmit={submit} className="bg-white rounded-xl border border-zinc-100 p-4 space-y-3" dir="rtl">
            {error && <div className="bg-red-50 text-red-600 text-xs p-2 rounded-lg">{error}</div>}

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">البريد الإلكتروني</label>
              <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="example@email.com" className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">كلمة المرور</label>
              <input required type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-300 text-brand focus:ring-brand/30"
                />
                <span className="text-xs text-zinc-600">تذكرني</span>
              </label>
              <Link to="/forgot-password" className="text-xs text-brand font-semibold hover:underline">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>

            <p className="text-center text-[11px] text-zinc-500">
              ما عندك حساب؟ <Link to="/signup" className="text-brand font-semibold hover:underline">إنشاء حساب</Link>
            </p>
          </form>
        </div>
      </section>

      {showWelcome && (
        <WelcomeOverlay type="return" name={userName} onDone={() => navigate(redirectPath)} />
      )}
    </>
  )
}
