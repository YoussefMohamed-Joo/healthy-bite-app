import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'

const API = import.meta.env.VITE_API_URL || ''

const settingMeta = {
  hero_features: { label: 'ميزات الهيرو', type: 'list-text', desc: 'نقاط مختصرة تظهر تحت العنوان الرئيسي' },
  about_values: { label: 'قيم صفحة عننا', type: 'list-object', desc: 'أيقونة، عنوان، وصف — تظهر في قسم القيم', fields: [
    { key: 'icon', label: 'الأيقونة (Leaf/Sparkles/Shield/Heart)' },
    { key: 'title', label: 'العنوان' },
    { key: 'desc', label: 'الوصف' },
  ]},
  contact_info: { label: 'معلومات التواصل', type: 'list-object', desc: 'أيقونة، عنوان، قيمة، ملخص — تظهر في صفحة الاتصال', fields: [
    { key: 'icon', label: 'الأيقونة (Phone/Mail/MapPin/Clock)' },
    { key: 'label', label: 'التسمية' },
    { key: 'value', label: 'القيمة' },
    { key: 'desc', label: 'الملخص' },
  ]},
  delivery_settings: { label: 'إعدادات التوصيل', type: 'list-object', desc: 'رسوم التوصيل، الحد الأدنى، مواعيد العمل', fields: [
    { key: 'key', label: 'المفتاح (delivery_fee / min_order / working_hours / delivery_time)' },
    { key: 'value', label: 'القيمة' },
    { key: 'desc', label: 'الوصف' },
  ]},
}

export default function AdminSiteSettings() {
  const [settings, setSettings] = useState({})
  const [dirty, setDirty] = useState({})
  const [saving, setSaving] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/settings?keys=hero_features,about_values,contact_info,delivery_settings`).then(r => r.json()),
    ]).then(([d]) => {
      setSettings(d.data || {})
      setInitialLoading(false)
    }).catch(() => setInitialLoading(false))
  }, [])

  const updateItem = (key, idx, field, value) => {
    const items = [...(settings[key] || [])]
    items[idx] = { ...items[idx], [field]: value }
    setSettings(p => ({ ...p, [key]: items }))
    setDirty(p => ({ ...p, [key]: true }))
  }

  const addItem = (key) => {
    const meta = settingMeta[key]
    if (!meta) return
    const empty = {}
    if (meta.type === 'list-text') empty.text = ''
    else if (meta.fields) meta.fields.forEach(f => { empty[f.key] = '' })
    setSettings(p => ({ ...p, [key]: [...(p[key] || []), empty] }))
    setDirty(p => ({ ...p, [key]: true }))
  }

  const removeItem = (key, idx) => {
    const items = [...(settings[key] || [])]
    items.splice(idx, 1)
    setSettings(p => ({ ...p, [key]: items }))
    setDirty(p => ({ ...p, [key]: true }))
  }

  const saveSetting = async (key) => {
    setSaving(true)
    try {
      await fetch(`${API}/settings`, {
        method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: settings[key], label: settingMeta[key]?.label }),
      })
      setDirty(p => ({ ...p, [key]: false }))
    } catch {}
    setSaving(false)
  }

  if (initialLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 text-brand animate-spin" />
    </div>
  )

  return (
    <div>
      <h2 className="font-cairo text-xl font-bold text-zinc-900 mb-6">إعدادات الموقع</h2>
      <div className="space-y-6">
        {Object.entries(settingMeta).map(([key, meta]) => {
          const items = settings[key] || []
          return (
            <div key={key} className="bg-white rounded-2xl border border-zinc-100 p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-cairo font-bold text-zinc-900">{meta.label}</h3>
                {dirty[key] && (
                  <button
                    onClick={() => saveSetting(key)}
                    disabled={saving}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand-dark disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    حفظ
                  </button>
                )}
              </div>
              <p className="text-zinc-400 text-xs mb-4">{meta.desc}</p>

              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-zinc-50 rounded-xl p-3">
                    <div className="flex-1 space-y-2">
                      {meta.type === 'list-text' ? (
                        <input value={item.text || ''} onChange={e => updateItem(key, idx, 'text', e.target.value)} className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                      ) : meta.fields?.map(f => (
                        <input key={f.key} value={item[f.key] || ''} onChange={e => updateItem(key, idx, f.key, e.target.value)} placeholder={f.label} className="w-full px-3 py-2 rounded-lg border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                      ))}
                    </div>
                    <button onClick={() => removeItem(key, idx)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 mt-1 cursor-pointer">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={() => addItem(key)} className="mt-3 px-3 py-1.5 rounded-lg border border-dashed border-zinc-300 text-xs text-zinc-500 hover:border-brand hover:text-brand transition-colors cursor-pointer">
                + إضافة
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
