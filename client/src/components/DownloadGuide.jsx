import { Download, ArrowDownToLine, ShieldCheck, CheckCircle, X } from 'lucide-react'

export default function DownloadGuide({ show, onClose }) {
  if (!show) return null

  const steps = [
    {
      icon: Download,
      title: 'حمّل الملف',
      desc: 'اضغط على زر التحميل، هينزل ملف APK على جهازك',
    },
    {
      icon: ArrowDownToLine,
      title: 'افتح الملف',
      desc: 'من شريط الإشعارات أو مجلد التحميلات، افتح الملف',
    },
    {
      icon: ShieldCheck,
      title: 'ثبّت anyway',
      desc: 'هتظهر رسالة "حظر التثبيت من مصادر غير معروفة" — اضغط "تثبيت anyway" وسمح مرة واحدة',
    },
  ]

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl w-[90%] max-w-sm mx-auto p-6 text-center" onClick={e => e.stopPropagation()}>
        <div className="flex justify-end -mt-2 -mr-2">
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-100 cursor-pointer">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="inline-flex items-center gap-2 bg-brand-light text-brand rounded-full px-4 py-1.5 text-xs font-bold mb-3">
          <CheckCircle className="w-3.5 h-3.5" />
          ٣ خطوات فقط
        </div>

        <h3 className="text-lg font-bold text-zinc-900 mb-1">تثبيت التطبيق</h3>
        <p className="text-xs text-zinc-500 mb-6">طريقة التثبيت على أندرويد</p>

        <div className="space-y-4 text-right">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-light flex items-center justify-center shrink-0">
                <step.icon className="w-4 h-4 text-brand" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-white bg-brand rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm font-bold text-zinc-900">{step.title}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-3 text-right">
          <p className="text-[11px] text-amber-800 font-semibold">⚠️ الإعدادات → الأمان</p>
          <p className="text-[10px] text-amber-700 mt-1">فعّل "التثبيت من مصادر غير معروفة" أو "السماح بتثبيت التطبيقات" مرة واحدة بس</p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-3 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-dark transition-colors cursor-pointer"
        >
          حسناً
        </button>
      </div>
    </div>
  )
}
