import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, ChevronLeft } from 'lucide-react'
import Hero from '@/components/Hero'
import SubscriptionPlans from '@/components/SubscriptionPlans'
import Testimonials from '@/components/Testimonials'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { ProductCardSkeleton } from '@/components/ui/skeleton'

const API = import.meta.env.VITE_API_URL || ''

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const { addItem } = useCart()

  useEffect(() => {
    fetch(`${API}/products?limit=8`)
      .then(r => r.json())
      .then(d => { setProducts(d.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <>
      <Helmet>
        <title>Helthy Bite | وجبات صحية - بني سويف</title>
        <meta name="description" content="Helthy Bite — أول منصة توصيل وجبات صحية في بني سويف. اطلب وجبات طازجة، محسوبة السعرات، وطعمها لذيذ. توصيل مجاني لباب البيت." />
        <meta property="og:title" content="Helthy Bite | وجبات صحية - بني سويف" />
        <meta property="og:description" content="Helthy Bite — أول منصة توصيل وجبات صحية في بني سويف." />
        <meta property="og:image" content="https://helthybite.vercel.app/og-image.svg" />
        <meta property="og:url" content="https://helthybite.vercel.app/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://helthybite.vercel.app/" />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FoodEstablishment',
            name: 'Helthy Bite',
            description: 'منصة توصيل وجبات صحية في مصر',
            url: 'https://helthybite.vercel.app',
            servesCuisine: 'Healthy',
            areaServed: 'Beni Suef, Egypt',
          })}
        </script>
      </Helmet>

      <Hero />

      {/* Menu Section */}
      <section className="py-16 md:py-20 bg-[var(--bg-primary)]" style={{ direction: 'rtl' }}>
        <div className="max-w-[1320px] mx-auto px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-cairo text-2xl md:text-3xl font-bold text-[var(--text-primary)]">المنيو</h2>
              <p className="text-[var(--text-secondary)] text-sm mt-1">وجبات طازة كل يوم</p>
            </div>
            <Link
              to="/menu"
              className="hidden sm:flex items-center gap-1 text-sm font-bold text-[#237C3C] hover:text-[#1A5E2E] transition-colors no-underline"
            >
              عرض الكل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {products.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06 }}
                    className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group"
                  >
                    <div className="h-48 overflow-hidden">
                      <img
                        src={product.image ? API + product.image : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'}
                        alt={product.nameAr}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-cairo font-bold text-[var(--text-primary)]">{product.nameAr}</h3>
                        <span className="text-xs font-semibold text-[#237C3C] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full">
                          {product.calories} سعرة
                        </span>
                      </div>
                      <p className="text-[var(--text-secondary)] text-xs mb-3 line-clamp-2">{product.descriptionAr || 'وجبة صحية ولذيذة'}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-[var(--text-primary)]">{product.price} ج.م</span>
                        <Button size="sm" variant="default" onClick={() => addItem(product)} className="gap-1.5">
                          <Plus className="w-4 h-4" />
                          أضف
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mobile view all */}
              <div className="mt-8 text-center sm:hidden">
                <Link
                  to="/menu"
                  className="inline-flex items-center gap-1 px-6 py-3 bg-[#237C3C] text-white rounded-xl text-sm font-bold hover:bg-[#1A5E2E] transition-colors no-underline"
                >
                  عرض كل الوجبات
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <SubscriptionPlans />
      <Testimonials />
    </>
  )
}
