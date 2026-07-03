import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Leaf, Calculator, Truck, BadgePercent } from 'lucide-react'
import { Button } from '@/components/ui/button'

const features = [
  { icon: Leaf, label: 'مكونات طبيعية' },
  { icon: Calculator, label: 'سعرات محسوبة' },
  { icon: Truck, label: 'توصيل سريع' },
  { icon: BadgePercent, label: 'أسعار مناسبة' },
]

export default function Hero() {
  return (
    <section className="min-h-screen bg-white pt-[72px] overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-72px)]">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="order-2 md:order-1"
          >
            <div className="inline-flex items-center gap-2 bg-primary-light text-primary text-sm font-bold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              توصيل مجاني لأول طلب
            </div>

            <h1 className="font-cairo text-[2.5rem] md:text-[3.5rem] leading-[1.15] font-extrabold text-charcoal mb-4">
              أكل صحي
              <br />
              <span className="text-primary">يوصل لباب بيتك</span>
            </h1>

            <p className="text-grey text-base md:text-lg leading-relaxed mb-8 max-w-lg">
              وجبات صحية محضرة بعناية، سعراتها محسوبة، وطعمها لا يُقاوم. نوصلها لك في أسرع وقت.
            </p>

            <div className="flex items-center gap-4 flex-wrap mb-12">
              <Link to="/menu">
                <Button size="lg" className="text-base px-9 shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40">
                  اطلب الآن
                </Button>
              </Link>
              <Link to="/menu">
                <Button variant="outline" size="lg" className="text-base border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-white hover:scale-105 px-9">
                  استعرض القائمة
                </Button>
              </Link>
            </div>

            {/* Features row */}
            <div className="flex flex-wrap gap-6">
              {features.map((f, i) => {
                const Icon = f.icon
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.4 + i * 0.1 } }}
                    className="flex items-center gap-2.5"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-charcoal">{f.label}</span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            className="order-1 md:order-2 flex items-center justify-center py-10"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl scale-125" />
              <div className="w-[340px] h-[340px] md:w-[420px] md:h-[420px] lg:w-[480px] lg:h-[480px] rounded-full border-4 border-primary/10 overflow-hidden shadow-2xl shadow-primary/20">
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=85"
                  alt="Healthy meal"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative dots */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-accent/10 rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
