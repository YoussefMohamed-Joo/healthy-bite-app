import { Download, X, ArrowRight, AlertTriangle } from 'lucide-react'
import { applyUpdate, dismissUpdate, hasDismissed } from '@/utils/appUpdate'

export default function UpdatePrompt({ data, force, onClose }) {
  if (!data) return null
  if (!force && hasDismissed(data.version)) return null

  const handleUpdate = () => {
    applyUpdate(data)
    if (force) onClose?.()
  }

  const handleLater = () => {
    dismissUpdate(data)
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-black/60 flex items-center justify-center" style={{ direction: 'rtl' }}>
      <div className="bg-white rounded-2xl w-[90%] max-w-sm mx-auto p-6 text-center" onClick={e => e.stopPropagation()}>
        {!force && (
          <div className="flex justify-end -mt-2 -mr-2">
            <button onClick={handleLater} className="p-1 rounded-lg hover:bg-zinc-100 cursor-pointer">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        )}

        {force ? (
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center mx-auto mb-4">
            <Download className="w-7 h-7 text-brand" />
          </div>
        )}

        <h3 className="text-lg font-bold text-zinc-900 mb-1">
          {force ? 'تحديث إجباري' : 'تحديث جديد متاح'}
        </h3>
        <p className="text-xs text-zinc-500 mb-1">الإصدار v{data.version}</p>
        {data.releaseNotes && (
          <p className="text-xs text-zinc-500 mb-5 leading-relaxed">{data.releaseNotes}</p>
        )}
        {!data.releaseNotes && <div className="mb-5" />}

        {force && (
          <p className="text-xs text-red-600 font-semibold bg-red-50 rounded-xl p-3 mb-5">
            يجب تحديث التطبيق لمتابعة الاستخدام
          </p>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={handleUpdate}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand text-white text-sm font-bold hover:bg-brand-dark transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {force ? 'تحديث الآن' : 'تحديث الآن'}
          </button>

          {!force && (
            <button
              onClick={handleLater}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              ذكرني لاحقاً
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
