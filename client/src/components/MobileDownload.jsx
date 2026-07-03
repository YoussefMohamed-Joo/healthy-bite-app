import { useState, useEffect } from 'react'
import { Download, Smartphone, Loader2 } from 'lucide-react'
import { trackDownload } from '@/utils/tracking'
import DownloadGuide from './DownloadGuide'

const API = import.meta.env.VITE_API_URL || 'https://healthybite-server.vercel.app'

export default function MobileDownload() {
  const [apkExists, setApkExists] = useState(null)
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    fetch(`${API}/mobile/build-status`)
      .then(r => r.json())
      .then(d => setApkExists(d?.android))
      .catch(() => setApkExists(false))
  }, [API])

  return (
    <section className="bg-gradient-to-br from-brand to-brand-dark py-16 md:py-20">
      <div className="max-w-[1320px] mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-white/15 text-white rounded-full px-4 py-1.5 text-sm font-semibold mb-4">
          <Smartphone className="w-4 h-4" />
          تطبيق الموبايل
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
          حمل تطبيق Helthy Bite
        </h2>
        <p className="text-white/80 text-sm mb-8 max-w-lg mx-auto">
          اطلب وجباتك الصحية بضغطة زر
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {apkExists === null ? (
            <div className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/90 text-brand">
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري التحميل...
            </div>
          ) : apkExists ? (
            <a
              href={`${API}/api/download/android`}
              className="flex items-center gap-3 px-8 py-3.5 rounded-xl bg-white text-brand hover:shadow-lg hover:-translate-y-0.5 text-sm font-bold transition-all no-underline"
              onClick={(e) => { trackDownload('android'); setTimeout(() => setShowGuide(true), 500) }}
            >
              <Download className="w-5 h-5" />
              <div className="text-right">
                <div className="text-[10px] opacity-60 font-normal">تحميل للـ</div>
                <div>Android APK</div>
              </div>
            </a>
          ) : (
            <div className="flex items-center gap-3 px-8 py-3.5 rounded-xl bg-white/90 text-brand/60 text-sm font-bold">
              <Download className="w-5 h-5" />
              <div className="text-right">
                <div className="text-[10px] opacity-60 font-normal">النسخة</div>
                <div>Android (قريباً)</div>
              </div>
            </div>
          )}
        </div>
      </div>
      <DownloadGuide show={showGuide} onClose={() => setShowGuide(false)} />
    </section>
  )
}
