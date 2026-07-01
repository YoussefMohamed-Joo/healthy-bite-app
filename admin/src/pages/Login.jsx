import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-zinc-100 p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center text-white font-extrabold text-xl mx-auto mb-3">H</div>
          <h1 className="font-cairo text-xl font-bold text-zinc-900">لوحة التحكم</h1>
          <p className="text-zinc-500 text-sm mt-1">سجل دخول كأدمن</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          <input required type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة السر" className="w-full px-4 py-3 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'جاري...' : 'تسجيل الدخول'}
          </Button>
        </form>
      </div>
    </div>
  )
}
