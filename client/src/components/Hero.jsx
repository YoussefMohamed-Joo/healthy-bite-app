import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] } },
})

export default function Hero() {
  return (
    <section className="relative w-full h-[90vh] overflow-hidden bg-zinc-950">
      {/* Image — RIGHT SIDE ONLY */}
      <img
        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1600&q=85"
        alt="Healthy food"
        className="absolute right-0 top-0 w-[60%] h-full object-cover"
      />

      {/* Gradient Overlay — LEFT AREA ONLY */}
      <div
        className="absolute left-0 top-0 w-[50%] h-full pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* Content Container */}
      <div className="relative z-[2] w-[40%] h-full p-20 flex flex-col justify-center">
        {/* Badge */}
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-5 py-2 text-sm text-white/90 mb-7 w-fit">
          <span>🥗</span>
          <span>توصيل مجاني • ٧ أيام</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          {...fadeUp(0.1)}
          className="font-cairo text-5xl md:text-6xl font-bold text-white leading-[1.2] mb-5"
        >
          أكل صحي<br />
          يوصل لباب <span className="text-brand">بيتك</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.2)}
          className="text-[#e5e7eb] text-lg max-w-[500px] mb-8 leading-relaxed"
        >
          وجبات محسوبة، طعم جامد، ونتايج هتحس بيها من أول أسبوع
        </motion.p>

        {/* Buttons */}
        <motion.div {...fadeUp(0.3)} className="flex gap-4">
          <Button variant="default" size="lg" className="rounded-xl px-7 py-3.5 text-base">
            اطلب دلوقتي
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <button className="border-2 border-white text-white bg-transparent rounded-xl px-7 py-3.5 text-base font-bold transition-all duration-200 hover:bg-white/10 hover:scale-[1.03] cursor-pointer">
            شوف المينيو
          </button>
        </motion.div>

        {/* Metrics */}
        <motion.div {...fadeUp(0.4)} className="flex items-center gap-7 mt-12">
          <div className="flex items-center gap-3">
            <span className="text-lg">⭐</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">٤٫٩</span>
              <span className="text-[11px] text-white/45 font-medium">تقييم</span>
            </div>
          </div>
          <div className="w-px h-7 bg-white/10" />
          <div className="flex items-center gap-3">
            <span className="text-lg">🔥</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">٣٥٠-٥٠٠</span>
              <span className="text-[11px] text-white/45 font-medium">سعرة</span>
            </div>
          </div>
          <div className="w-px h-7 bg-white/10" />
          <div className="flex items-center gap-3">
            <span className="text-lg">✅</span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">٥٠,٠٠٠+</span>
              <span className="text-[11px] text-white/45 font-medium">عميل</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }}
        className="absolute bottom-0 left-0 right-0 z-10 bg-black/40 backdrop-blur-md border-t border-white/5 py-4"
      >
        <div className="max-w-[1320px] mx-auto px-10">
          <div className="flex justify-center gap-12 flex-wrap">
            {[
              { icon: '🥑', label: 'مكونات طبيعية' },
              { icon: '📊', label: 'سعرات محسوبة' },
              { icon: '🚚', label: 'توصيل سريع' },
              { icon: '💪', label: 'مناسب للجيم' },
            ].map((f) => (
              <span key={f.label} className="flex items-center gap-2 text-sm font-medium text-white/75 hover:text-brand transition-colors">
                <span className="text-lg">{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
