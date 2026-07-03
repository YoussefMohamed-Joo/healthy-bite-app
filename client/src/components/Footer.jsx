import { useState, useEffect } from 'react'
import { Leaf, Mail, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

const API = import.meta.env.VITE_API_URL || ''

export default function Footer() {
  const [contactInfo, setContactInfo] = useState(null)

  useEffect(() => {
    fetch(`${API}/settings?keys=contact_info`)
      .then(r => r.json())
      .then(d => {
        const info = d.data?.contact_info || []
        const map = {}
        info.forEach(i => { map[i.icon] = i.value })
        setContactInfo(map)
      })
      .catch(() => {})
  }, [])

  return (
    <footer className="bg-[#1f2937] text-white">
      <div className="max-w-[1320px] mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <Leaf className="w-6 h-6 text-[#4caf50]" />
              <span className="font-bold text-lg">Helthy <span className="text-[#4caf50]">Bite</span></span>
            </div>
            <p className="text-[#9ca3af] text-sm leading-relaxed">
              وجبات صحية طازة توصل لباب بيتك. سعرات محسوبة، مكونات طبيعية، وطعم جامد.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm mb-4">روابط سريعة</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'الرئيسية' },
                { to: '/menu', label: 'المينيو' },
                { to: '/plans', label: 'الخطط' },
                { to: '/about', label: 'عننا' },
                { to: '/contact', label: 'اتصل بنا' },
                { to: '/faq', label: 'الأسئلة الشائعة' },
                { to: '/terms', label: 'شروط الاستخدام' },
                { to: '/privacy', label: 'سياسة الخصوصية' },
                { to: '/refund-policy', label: 'الإلغاء والاسترجاع' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-[#9ca3af] text-sm hover:text-[#4caf50] transition-colors no-underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm mb-4">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-[#9ca3af] text-sm">
                <Phone className="w-4 h-4 text-[#4caf50]" />
                {contactInfo?.Phone || '01033558125'}
              </li>
              <li className="flex items-center gap-2.5 text-[#9ca3af] text-sm">
                <Mail className="w-4 h-4 text-[#4caf50]" />
                {contactInfo?.Mail || 'hello@healthybite.com'}
              </li>
              <li className="flex items-center gap-2.5 text-[#9ca3af] text-sm">
                <MapPin className="w-4 h-4 text-[#4caf50]" />
                {contactInfo?.MapPin || 'بني سويف، مصر'}
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-bold text-sm mb-4">تابعنا</h4>
            <div className="flex gap-3">
              {[
                { icon: 'f', href: '#' },
                { icon: '𝕏', href: '#' },
                { icon: '𝕚', href: '#' },
              ].map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#4caf50] transition-colors text-sm font-bold"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-[#6b7280] text-xs">
          © {new Date().getFullYear()} Helthy Bite. جميع الحقوق محفوظة. <br />بتصميم وتطوير المهندس <span className="text-[#4caf50]">يوسف محمد</span>.
        </div>
      </div>
    </footer>
  )
}
