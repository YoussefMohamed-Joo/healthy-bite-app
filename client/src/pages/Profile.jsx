import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { User, Save, Loader2, Download, Trash2, Mail, Phone, Home, Lock, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { checkUpdate } from '@/utils/appUpdate'
import { dispatchUpdateFound } from '@/utils/updateEvent'
import AddressManager from '@/components/AddressManager'

const API = import.meta.env.VITE_API_URL || ''

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [msg, setMsg] = useState({ text: '', type: '' })
  const [deleteConfirm, setDeleteConfirm] = useState('idle')
  const [deleteInput, setDeleteInput] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || '', phone: user.phone || '', address: user.address || '' })
    }
  }, [user])

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg({ text: '', type: '' })
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const d = await res.json()
      if (!res.ok) { setMsg({ text: d.message || 'حدث خطأ', type: 'error' }); return }
      if (d.user) updateUser(d.user)
      setMsg({ text: '✅ تم حفظ البيانات بنجاح', type: 'success' })
    } catch { setMsg({ text: 'حدث خطأ في الاتصال', type: 'error' }) }
    setSaving(false)
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setMsg({ text: '', type: '' })
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMsg({ text: 'كلمة المرور غير متطابقة', type: 'error' })
      return
    }
    if (passwordForm.newPassword.length < 6) {
      setMsg({ text: 'كلمة المرور الجديدة لا تقل عن 6 أحرف', type: 'error' })
      return
    }
    setChangingPassword(true)
    try {
      const res = await fetch(`${API}/auth/profile`, {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
      })
      const d = await res.json()
      if (!res.ok) { setMsg({ text: d.message || 'حدث خطأ', type: 'error' }); return }
      setMsg({ text: '✅ تم تغيير كلمة المرور بنجاح', type: 'success' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch { setMsg({ text: 'حدث خطأ', type: 'error' }) }
    setChangingPassword(false)
  }

  return (
    <>
      <Helmet>
        <title>الملف الشخصي — Helthy Bite</title>
        <meta name="description" content="إدارة بياناتك الشخصية وتغيير كلمة المرور في Helthy Bite." />
        <meta property="og:title" content="الملف الشخصي — Helthy Bite" />
        <meta property="og:description" content="إدارة بياناتك الشخصية في Helthy Bite." />
        <meta property="og:image" content="https://helthybite.vercel.app/og-image.svg" />
        <meta property="og:url" content="https://helthybite.vercel.app/profile" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://helthybite.vercel.app/profile" />
      </Helmet>
      <section className="min-h-screen bg-grey-light pt-[72px] pb-10">
        <div className="max-w-[600px] mx-auto px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="font-cairo text-2xl font-extrabold text-charcoal">الملف الشخصي</h1>
              <p className="text-grey text-sm flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
            </div>
          </div>

          {/* Messages */}
          {msg.text && (
            <div className={`flex items-center gap-2 text-sm p-4 rounded-xl mb-5 border ${
              msg.type === 'success'
                ? 'bg-green-50 border-green-100 text-green-700'
                : 'bg-red-50 border-red-100 text-red-600'
            }`}>
              {msg.type === 'success'
                ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                : <AlertCircle className="w-4 h-4 shrink-0" />
              }
              <span>{msg.text}</span>
            </div>
          )}

          {/* Personal Data */}
          <form onSubmit={saveProfile} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 mb-6">
            <h3 className="font-cairo font-bold text-lg text-charcoal flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              البيانات الشخصية
            </h3>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-1.5">الاسم بالكامل</label>
              <div className="relative">
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="الاسم بالكامل"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm text-charcoal placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-grey" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-1.5">رقم الهاتف</label>
              <div className="relative">
                <input
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="01000000000"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm text-charcoal placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-grey" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-1.5">العنوان بالتفصيل</label>
              <div className="relative">
                <input
                  value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  placeholder="المدينة، الحي، الشارع، رقم المبني"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm text-charcoal placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <Home className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-grey" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <input
                  value={user?.email || ''}
                  disabled
                  placeholder="البريد الإلكتروني"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm bg-grey-light text-grey cursor-not-allowed"
                />
                <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-grey" />
              </div>
              <p className="text-[11px] text-grey mt-1">لا يمكن تغيير البريد الإلكتروني</p>
            </div>

            <Button type="submit" disabled={saving} className="w-full" size="lg">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              حفظ التغييرات
            </Button>
          </form>

          {/* Change Password */}
          <form onSubmit={changePassword} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-cairo font-bold text-lg text-charcoal flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              تغيير كلمة المرور
            </h3>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-1.5">كلمة المرور الحالية</label>
              <input
                required
                value={passwordForm.currentPassword}
                onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                type="password"
                placeholder="كلمة المرور الحالية"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-charcoal placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-1.5">كلمة المرور الجديدة</label>
              <input
                required
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                type="password"
                placeholder="أحرف إنجليزية + أرقام — لا تقل عن 6"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-charcoal placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-charcoal mb-1.5">تأكيد كلمة المرور</label>
              <input
                required
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                type="password"
                placeholder="أعد كتابة كلمة المرور الجديدة"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-charcoal placeholder:text-grey focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>

            <Button type="submit" disabled={changingPassword} variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white" size="lg">
              {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              تغيير كلمة المرور
            </Button>
          </form>

          {/* Addresses */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
            <AddressManager />
          </div>

          {/* App Updates */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 mt-6">
            <h3 className="font-cairo font-bold text-lg text-charcoal flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              تحديثات التطبيق
            </h3>
            <p className="text-grey text-sm">تحقق من وجود إصدار جديد للتطبيق.</p>
            <Button
              variant="outline"
              className="w-full border-gray-200 hover:border-primary hover:text-primary"
              onClick={async () => {
                const update = await checkUpdate()
                if (update) {
                  dispatchUpdateFound(update, update.forceUpdate)
                } else {
                  setMsg({ text: '🎉 التطبيق محدث لأحدث إصدار', type: 'success' })
                }
              }}
            >
              <RefreshCw className="w-4 h-4" /> التحقق من وجود تحديثات
            </Button>
          </div>

          {/* Data & Privacy */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4 mt-6">
            <h3 className="font-cairo font-bold text-lg text-charcoal flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              البيانات والخصوصية
            </h3>
            <p className="text-grey text-sm">يمكنك تصدير بياناتك أو حذف حسابك بالكامل.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" className="flex-1 border-gray-200 hover:border-primary hover:text-primary" onClick={async () => {
                try {
                  const res = await fetch(`${API}/auth/export-data`, { credentials: 'include' })
                  const d = await res.json()
                  if (d.data) {
                    const blob = new Blob([JSON.stringify(d.data, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = 'my-data.json'; a.click()
                    URL.revokeObjectURL(url)
                  }
                } catch { setMsg({ text: 'حدث خطأ أثناء التصدير', type: 'error' }) }
              }}>
                <Download className="w-4 h-4" /> تصدير بياناتي
              </Button>
              <Button variant="outline" className="flex-1 text-red-500 border-red-200 hover:bg-red-50" onClick={() => setDeleteConfirm('first')}>
                <Trash2 className="w-4 h-4" /> حذف الحساب نهائياً
              </Button>
            </div>
          </div>

          {/* Delete confirmation modals */}
          {deleteConfirm === 'first' && (
            <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center" onClick={() => { setDeleteConfirm('idle'); setDeleteInput('') }}>
              <div className="bg-white rounded-2xl w-[90%] max-w-sm mx-auto p-6 text-center" onClick={e => e.stopPropagation()}>
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">هل أنت متأكد من حذف الحساب؟</h3>
                <p className="text-sm text-zinc-500 mb-6">سيتم حذف كل بياناتك وطلباتك السابقة. هذا الإجراء غير قابل للتراجع.</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setDeleteConfirm('second'); setDeleteInput('') }}
                    className="w-full py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    نعم، متأكد
                  </button>
                  <button
                    onClick={() => setDeleteConfirm('idle')}
                    className="w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {deleteConfirm === 'second' && (
            <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center" onClick={() => { setDeleteConfirm('idle'); setDeleteInput('') }}>
              <div className="bg-white rounded-2xl w-[90%] max-w-sm mx-auto p-6 text-center" onClick={e => e.stopPropagation()}>
                <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-7 h-7 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">تأكيد الحذف النهائي</h3>
                <p className="text-sm text-zinc-500 mb-4">هذا الإجراء نهائي ولا يمكن التراجع عنه. اكتب <strong>DELETE</strong> للتأكيد.</p>
                <input
                  autoFocus
                  value={deleteInput}
                  onChange={e => setDeleteInput(e.target.value)}
                  placeholder="اكتب DELETE"
                  className="w-full px-4 py-3 rounded-xl border border-red-200 text-sm text-center font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500 transition-all mb-4"
                />
                <div className="flex flex-col gap-2">
                  <button
                    disabled={deleteInput !== 'DELETE' || deleting}
                    onClick={async () => {
                      setDeleting(true)
                      try {
                        const res = await fetch(`${API}/auth/account`, { method: 'DELETE', credentials: 'include' })
                        if (res.ok) { logout(); window.location.href = '/' }
                        else { const d = await res.json(); setMsg({ text: d.message || 'حدث خطأ', type: 'error' }); setDeleteConfirm('idle') }
                      } catch { setMsg({ text: 'حدث خطأ في الاتصال', type: 'error' }); setDeleteConfirm('idle') }
                      setDeleting(false)
                    }}
                    className="w-full py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {deleting ? 'جارٍ الحذف...' : 'تأكيد الحذف'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm('idle')}
                    className="w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      </section>
    </>
  )
}
