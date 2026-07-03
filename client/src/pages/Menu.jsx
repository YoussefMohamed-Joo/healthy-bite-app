import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'

const API = import.meta.env.VITE_API_URL || ''

export default function Menu() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const { addItem } = useCart()

  useEffect(() => {
    fetch(`${API}/products`).then(r => r.json()).then(d => setProducts(d.data || [])).catch(console.error)
  }, [])

  const filtered = products.filter(p =>
    p.nameAr?.includes(search) || p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section className="min-h-screen bg-zinc-50 pt-[70px]">
      <div className="max-w-[1320px] mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-cairo text-3xl font-bold text-zinc-900">المينيو</h1>
            <p className="text-zinc-500 text-sm mt-1">كل الوجبات الصحية اللي تحتاجها</p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحث عن وجبة..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-5">
          {filtered.map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
              className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(25%-0.9375rem)] min-w-[250px] bg-white rounded-2xl border border-zinc-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-52 overflow-hidden">
                <img src={product.image ? API + product.image : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'} alt={product.nameAr} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-cairo font-bold text-lg text-zinc-900">{product.nameAr}</h3>
                  <span className="text-xs font-semibold text-brand bg-brand-light px-3 py-1 rounded-full">
                    {product.calories} سعرة
                  </span>
                </div>
                <p className="text-zinc-500 text-sm mb-4">{product.descriptionAr || 'وجبة صحية ولذيذة'}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg text-zinc-900">{product.price} ج.م</span>
                  <Button size="sm" variant="default" onClick={() => addItem(product)} className="gap-1.5">
                    <Plus className="w-4 h-4" />
                    أضف
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-zinc-400">
            <p className="text-lg">لا توجد وجبات متاحة حالياً</p>
          </div>
        )}
      </div>
    </section>
  )
}
