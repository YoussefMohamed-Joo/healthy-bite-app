import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, Sparkles, Heart } from 'lucide-react'

const icons = [Leaf, Sparkles, Heart]

export default function WelcomeOverlay({ type, name, onDone }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 300)
    const t2 = setTimeout(() => setStep(2), 1200)
    const t3 = setTimeout(() => onDone(), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  const isWelcome = type === 'welcome'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="bg-white rounded-3xl p-8 md:p-10 text-center max-w-sm mx-4 shadow-2xl"
        >
          {step === 0 && (
            <motion.div
              key="icon0"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12 }}
              className="w-20 h-20 rounded-2xl bg-brand-light flex items-center justify-center mx-auto mb-5"
            >
              <Leaf className="w-10 h-10 text-brand" />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="icon1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, delay: 0.1 }}
              className="flex justify-center gap-3 mb-5"
            >
              {icons.map((Icon, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-14 h-14 rounded-full bg-brand-light flex items-center justify-center"
                >
                  <Icon className="w-6 h-6 text-brand" />
                </motion.div>
              ))}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="text"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <motion.h2
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="font-cairo text-2xl font-extrabold text-zinc-900 mb-2"
              >
                {isWelcome ? 'أهلاً بك في Helthy Bite! 🎉' : 'مرحباً بعودتك! 👋'}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-zinc-500 text-sm"
              >
                {isWelcome ? `يسعدنا انضمامك ${name}!` : `نفتقدك ${name}!`}
              </motion.p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-1 bg-brand rounded-full mt-4 mx-auto max-w-[200px]"
              />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
