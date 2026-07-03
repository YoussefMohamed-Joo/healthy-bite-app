import { useState, useEffect, useCallback } from 'react'
import { X, Download, Smartphone, QrCode, Bell, Apple } from 'lucide-react'
import { getDeviceType } from '@/utils/device'
import { trackDownload } from '@/utils/tracking'
import IOSInstallGuide from './IOSInstallGuide'

const API = import.meta.env.VITE_API_URL || 'https://healthybite-server.vercel.app'
const APK_PATH = `${API}/api/download/android`

export default function AppManager() {
  const [buildStatus, setBuildStatus] = useState(null)
  const [device, setDevice] = useState('desktop')
  const [dismissed, setDismissed] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setDevice(getDeviceType())
    fetch(`${API}/mobile/build-status`)
      .then(r => r.json())
      .then(d => setBuildStatus(d))
      .catch(() => setBuildStatus({ android: false, ios: false }))
  }, [API])

  const handleNotify = useCallback(async () => {
    if (!email.trim()) return
    setSubmitting(true)
    try {
      await fetch('/mobile/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), device }),
      })
      setSubmitted(true)
    } catch {}
    setSubmitting(false)
  }, [email, device])

  if (dismissed) return null

  const apkReady = buildStatus?.android

  // Android — direct download button
  if (device === 'android') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 shadow-2xl">
        <div className="max-w-[1320px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Smartphone className="w-5 h-5 text-brand shrink-0" />
            <span className="text-sm font-bold text-zinc-900 truncate">حمّل التطبيق</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {apkReady ? (
              <a
                href={APK_PATH}
                onClick={() => trackDownload('android')}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-bold hover:bg-brand-dark transition-colors no-underline cursor-pointer"
              >
                <Download className="w-4 h-4" />
                تحميل APK
              </a>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-600 font-semibold whitespace-nowrap">قيد التجهيز</span>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={submitted ? 'تم ✓' : 'بريدك'}
                  disabled={submitted}
                  className="w-28 px-3 py-2 rounded-lg border border-zinc-200 text-xs outline-none focus:border-brand"
                />
                <button
                  onClick={handleNotify}
                  disabled={submitting || submitted || !email.trim()}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 disabled:opacity-50 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {submitted ? 'تم' : 'نبهني'}
                </button>
              </div>
            )}
            <button onClick={() => setDismissed(true)} className="p-2 rounded-lg hover:bg-zinc-100 cursor-pointer">
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // iOS — PWA install guide
  if (device === 'ios') {
    return (
      <>
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 shadow-2xl">
          <div className="max-w-[1320px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Apple className="w-5 h-5 text-zinc-800 shrink-0" />
              <span className="text-sm font-bold text-zinc-900 truncate">ثبّت التطبيق</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowIOSGuide(true)}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-zinc-800 text-white text-sm font-bold hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                كيفية التثبيت
              </button>
              <button onClick={() => setDismissed(true)} className="p-2 rounded-lg hover:bg-zinc-100 cursor-pointer">
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
        {showIOSGuide && <IOSInstallGuide />}
      </>
    )
  }

  // Desktop — QR + direct download
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-zinc-200 shadow-2xl">
        <div className="max-w-[1320px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Smartphone className="w-5 h-5 text-brand shrink-0" />
            <span className="text-sm font-bold text-zinc-900 truncate">حمّل التطبيق</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              QR
            </button>
            {apkReady ? (
              <a
                href={APK_PATH}
                onClick={() => trackDownload('android')}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-bold hover:bg-brand-dark transition-colors no-underline cursor-pointer"
              >
                <Download className="w-4 h-4" />
                تحميل APK
              </a>
            ) : (
              <div className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-bold">
                <Bell className="w-4 h-4" />
                قريباً
              </div>
            )}
            <button onClick={() => setDismissed(true)} className="p-2 rounded-lg hover:bg-zinc-100 cursor-pointer">
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
      </div>

      {showQR && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowQR(false)}>
          <div className="bg-white rounded-2xl p-8 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-48 h-48 mx-auto mb-4 bg-brand-light rounded-xl flex items-center justify-center">
              <QrCode className="w-32 h-32 text-brand" />
            </div>
            <p className="text-sm font-bold text-zinc-900">امسح QR Code بكاميرا موبايلك</p>
            <p className="text-xs text-zinc-500 mt-1">هتفتح صفحة التحميل على موبايلك</p>
          </div>
        </div>
      )}
    </>
  )
}
