import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import WelcomeOverlay from '@/components/WelcomeOverlay'

const arabicRegex = /[\u0600-\u06FF]/

const schema = z.object({
  name: z.string().min(3, 'الاسم لا يقل عن 3 أحرف'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().regex(/^01[0-9]{9}$/, 'رقم الهاتف غير صالح — يجب أن يبدأ 01 ويتكون من 11 رقم'),
  password: z
    .string()
    .min(6, 'كلمة المرور لا تقل عن 6 أحرف')
    .refine(val => !arabicRegex.test(val), { message: '❌ كلمة المرور يجب أن تكون باللغة الإنجليزية فقط — حول الباس للانجليزي' })
    .refine(val => /[A-Za-z]/.test(val), { message: 'يجب أن تحتوي على حرف إنجليزي واحد على الأقل' })
    .refine(val => /[0-9]/.test(val), { message: 'يجب أن تحتوي على رقم واحد على الأقل' }),
  confirmPassword: z.string(),
  address: z.string().min(5, 'العنوان لا يقل عن 5 أحرف'),
}).refine(d => d.password === d.confirmPassword, { message: 'كلمة المرور غير متطابقة', path: ['confirmPassword'] })

const API = import.meta.env.VITE_API_URL || ''

export default function Signup() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [userName, setUserName] = useState('')
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpEmail, setOtpEmail] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [formData, setFormData] = useState(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  const submit = async (data) => {
    setError('')
    setFormData(data)
    try {
      const res = await fetch(`${API}/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })
      const json = await res.json()
      if (json.status === 'error') throw new Error(json.message)
      setOtpEmail(data.email)
      setOtpCode('')
      setOtpError('')
      setShowOtpModal(true)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return
    setOtpLoading(true)
    setOtpError('')
    try {
      const res = await fetch(`${API}/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp: otpCode }),
      })
      const json = await res.json()
      if (json.status === 'error') throw new Error(json.message)
      setShowOtpModal(false)
      await authRegister(formData.name, formData.email, formData.password, formData.phone, formData.address, rememberMe)
      setUserName(formData.name)
      setShowWelcome(true)
    } catch (err) {
      setOtpError(err.message)
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>إنشاء حساب — Helthy Bite</title>
        <meta name="description" content="أنشئ حساب جديد في Helthy Bite واطلب وجبات صحية أونلاين. اشترك عشان تتابع طلباتك وتحصل على عروض حصرية." />
        <meta property="og:title" content="إنشاء حساب — Helthy Bite" />
        <meta property="og:description" content="أنشئ حساب جديد في Helthy Bite واطلب وجبات صحية أونلاين." />
        <meta property="og:image" content="https://helthybite.vercel.app/og-image.svg" />
        <meta property="og:url" content="https://helthybite.vercel.app/signup" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://helthybite.vercel.app/signup" />
      </Helmet>
      <section className="min-h-screen bg-grey-light pt-[72px] flex items-center justify-center py-10">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-7 h-7 text-primary" />
            </div>
            <h1 className="font-cairo text-2xl font-extrabold text-charcoal">إنشاء حساب جديد</h1>
            <p className="text-grey text-sm mt-1">اشترك عشان تتابع طلباتك وتحصل على عروض حصرية</p>
          </div>

          <form onSubmit={handleSubmit(submit)} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4" dir="rtl">
            <input type="text" name="website_url" tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }} />

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-charcoal mb-1.5">
                الاسم بالكامل <span className="text-red-500">*</span>
              </label>
              <input {...register('name')} placeholder="محمد أحمد" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-charcoal placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white" />
              {errors.name && <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5"><AlertCircle className="w-3 h-3" />{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-1.5">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <input type="email" {...register('email')} placeholder="example@email.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-charcoal placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white" />
              {errors.email && <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5"><AlertCircle className="w-3 h-3" />{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-1.5">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <input type="tel" {...register('phone')} placeholder="01000000000" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-charcoal placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white" />
              {errors.phone && <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5"><AlertCircle className="w-3 h-3" />{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-1.5">
                العنوان بالتفصيل <span className="text-red-500">*</span>
              </label>
              <input {...register('address')} placeholder="المدينة، الحي، الشارع، رقم المبني" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-charcoal placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white" />
              {errors.address && <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5"><AlertCircle className="w-3 h-3" />{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-1.5">
                كلمة المرور <span className="text-red-500">*</span>
              </label>
              <input type="password" {...register('password')} placeholder="أحرف إنجليزية + أرقام" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-charcoal placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white" />
              {errors.password && <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5"><AlertCircle className="w-3 h-3" />{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-1.5">
                تأكيد كلمة المرور <span className="text-red-500">*</span>
              </label>
              <input type="password" {...register('confirmPassword')} placeholder="أعد كتابة كلمة المرور" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-charcoal placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white" />
              {errors.confirmPassword && <p className="flex items-center gap-1 text-red-500 text-xs mt-1.5"><AlertCircle className="w-3 h-3" />{errors.confirmPassword.message}</p>}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-brand focus:ring-brand/30"
              />
              <span className="text-sm text-zinc-600">تذكرني</span>
            </label>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
            </Button>

            <p className="text-center text-sm text-grey">
              عندك حساب؟{' '}
              <Link to="/login" className="text-primary font-bold hover:text-primary-dark transition-colors">تسجيل الدخول</Link>
            </p>
          </form>
        </div>
      </section>

      {showOtpModal && (
        <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4" onClick={() => setShowOtpModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-cairo font-bold text-lg text-charcoal mb-1">تحقق من بريدك</h3>
            <p className="text-grey text-sm mb-6">أدخل الرمز المكون من 6 أرقام المرسل إلى</p>
            <p className="text-charcoal font-bold text-sm mb-4 -mt-3" dir="ltr">{otpEmail}</p>
            {otpError && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl mb-4 text-right">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}
            <div className="flex gap-2 justify-center mb-6" dir="ltr">
              {[0,1,2,3,4,5].map(i => (
                <input key={i} type="text" maxLength={1} value={otpCode[i] || ''} onChange={e => {
                  const val = e.target.value.replace(/\D/g, '')
                  const newCode = [...otpCode]
                  newCode[i] = val
                  setOtpCode(newCode.join(''))
                  if (val && i < 5) e.target.nextElementSibling?.focus()
                }} onKeyDown={e => { if (!e.target.value && e.key === 'Backspace' && i > 0) e.target.previousElementSibling?.focus() }}
                className="w-12 h-13 text-center text-lg font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none transition-all" />))}
            </div>
            <button onClick={handleVerifyOtp} disabled={otpCode.length !== 6 || otpLoading}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/20">
              {otpLoading ? 'جاري التحقق...' : 'تأكيد'}
            </button>
          </div>
        </div>
      )}

      {showWelcome && (
        <WelcomeOverlay type="welcome" name={userName} onDone={() => navigate('/')} />
      )}
    </>
  )
}
