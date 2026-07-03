import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Loader2, Flame } from 'lucide-react'
import { useCart } from '@/context/CartContext'

const API = import.meta.env.VITE_API_URL || ''

export default function PopularMeals() {
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState(new Set())
  const { addItem } = useCart()

  useEffect(() => {
    fetch(`${API}/products?featured=true&limit=8`)
      .then(r => r.json())
      .then(data => { setMeals(data.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-[#f9fafb]">
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-[#2E7D32] animate-spin" /></div>
      </section>
    )
  }

  if (meals.length === 0) return null

  // Split into rows of 4 for premium layout
  const rows = []
  for (let i = 0; i < meals.length; i += 4) {
    rows.push(meals.slice(i, i + 4))
  }

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-white to-[#f9fafb]">
      <div className="max-w-[1320px] mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-bold px-4 py-1.5 rounded-full mb-3">
            <Flame className="w-3.5 h-3.5" />
            الأكثر طلباً
          </div>
          <h2 className="font-cairo text-2xl md:text-3xl font-extrabold text-[#1f2937] mb-2">الوجبات الأكثر طلباً</h2>
          <p className="text-[#6b7280] text-sm">أشهر الوجبات الصحية اللي اختارها عملائنا</p>
        </div>

        <div className="space-y-6">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 justify-items-center">
              {row.map((meal, i) => (
                <motion.div
                  key={meal._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (rowIdx * 4 + i) * 0.06, duration: 0.5 }}
                  className="w-full max-w-[310px] bg-white rounded-3xl overflow-hidden border border-[#e5e7eb] hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 group flex flex-col"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={meal.image || meal.img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'}
                      alt={meal.nameAr}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <button
                      onClick={() => toggleFavorite(meal._id)}
                      className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all cursor-pointer border-none shadow-sm hover:shadow-md z-10"
                    >
                      <Heart className={`w-[18px] h-[18px] transition-all ${favorites.has(meal._id) ? 'text-red-500 fill-red-500 scale-110' : 'text-[#6b7280]'}`} />
                    </button>
                    <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-[#2E7D32] text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                      {meal.calories} سعرة
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-cairo font-bold text-[#1f2937] text-lg mb-1">{meal.nameAr}</h3>
                    <p className="text-[#6b7280] text-xs mb-4 line-clamp-1">{meal.name}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-xl text-[#2E7D32]">{meal.price.toFixed(2)}</span>
                        <span className="text-[#6b7280] text-xs mr-1">ج.م</span>
                      </div>
                      <button
                        onClick={() => addItem(meal)}
                        className="bg-[#2E7D32] text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 hover:bg-[#1b5e20] hover:scale-[1.03] cursor-pointer border-none shadow-md shadow-[#2E7D32]/20 flex items-center gap-2"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        أضف للسلة
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {/* Fill remaining slots in incomplete row with invisible placeholders to maintain grid */}
              {row.length < 4 && Array.from({ length: 4 - row.length }).map((_, pi) => (
                <div key={`placeholder-${pi}`} className="hidden lg:block lg:col-span-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
