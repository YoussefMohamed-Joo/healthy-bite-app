import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>الصفحة غير موجودة | Helthy Bite</title>
      </Helmet>
      <div className="min-h-[70vh] flex items-center justify-center bg-[#F8F9F8] p-6" style={{ direction: 'rtl' }}>
        <div className="text-center max-w-md">
          <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-[#E8F5E9] flex items-center justify-center">
            <span className="text-6xl font-bold text-[#237C3C]">404</span>
          </div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] mb-3">الصفحة غير موجودة</h1>
          <p className="text-[#666666] mb-8 text-sm leading-relaxed">
            عذراً، الصفحة اللي بتدور عليها مش موجودة. ممكن تكون اتحذفت أو اتغيرت.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-[#237C3C] text-white rounded-xl text-sm font-bold hover:bg-[#1A5E2E] transition-colors no-underline"
            >
              الرجوع للرئيسية
            </Link>
            <Link
              to="/menu"
              className="px-6 py-3 border-2 border-[#237C3C] text-[#237C3C] rounded-xl text-sm font-bold hover:bg-[#237C3C] hover:text-white transition-colors no-underline"
            >
              استعرض الوجبات
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
