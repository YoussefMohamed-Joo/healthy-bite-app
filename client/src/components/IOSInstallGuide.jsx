import { useState } from 'react'
import { X, Share2, Plus, ArrowDown } from 'lucide-react'

const STEPS = [
  { icon: Share2, label: 'اضغط على زر المشاركة' },
  { icon: Plus, label: 'اختر "إضافة إلى الشاشة الرئيسية"' },
  { icon: ArrowDown, label: 'اضغط "إضافة" في الأعلى' },
]

export default function IOSInstallGuide() {
  const [show, setShow] = useState(true)
  const [step, setStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center" onClick={() => setShow(!show)}>
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm p-6 text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-zinc-900">تثبيت التطبيق</h3>
          <button onClick={() => setDismissed(true)} className="p-1 rounded-lg hover:bg-zinc-100 cursor-pointer">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <div className="bg-zinc-50 rounded-xl p-6 mb-4">
          {show && (
            <div className="flex flex-col items-center gap-3">
              {(() => {
                const S = STEPS[step]
                return (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-brand-light flex items-center justify-center">
                      <S.icon className="w-8 h-8 text-brand" />
                    </div>
                    <p className="text-sm font-semibold text-zinc-700">{S.label}</p>
                  </>
                )
              })()}
              <div className="flex gap-1.5 mt-2">
                {STEPS.map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-brand' : 'bg-zinc-200'}`} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-dark transition-colors cursor-pointer"
            >
              التالي
            </button>
          ) : (
            <button
              onClick={() => setDismissed(true)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-dark transition-colors cursor-pointer"
            >
              تم ✓
            </button>
          )}
          <button
            onClick={() => { setStep(0); setDismissed(true) }}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-500 hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            تخطي
          </button>
        </div>
      </div>
    </div>
  )
}
