import { Helmet } from 'react-helmet-async'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, SlidersHorizontal, ChevronLeft, ChevronRight, X, Star } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import ReviewList from '@/components/ReviewList'
import ReviewForm from '@/components/ReviewForm'

const API = import.meta.env.VITE_API_URL || ''
const ITEMS_PER_PAGE = 12

const allCategories = ['وجبات رئيسية', 'سلطات', 'مشروبات', 'مقبلات', 'حلويات']

const sortOptions = [
  { value: '', label: 'الأحدث' },
  { value: 'price_asc', label: 'السعر: من الأقل' },
  { value: 'price_desc', label: 'السعر: من الأعلى' },
  { value: 'calories_asc', label: 'السعرات: من الأقل' },
  { value: 'calories_desc', label: 'السعرات: من الأعلى' },
]

export default function Menu() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [expandedReview, setExpandedReview] = useState(null)
  const { addItem } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    setLoading(true)
    fetch(`${API}/products`).then(r => r.json()).then(d => {
      setProducts(d.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = products.filter(p => {
    const matchesSearch = p.nameAr?.includes(search) || p.name?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = !category || p.categoryAr === category || p.category === category
    return matchesSearch && matchesCategory
  })

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'price_asc': return (a.price || 0) - (b.price || 0)
      case 'price_desc': return (b.price || 0) - (a.price || 0)
      case 'calories_asc': return (a.calories || 0) - (b.calories || 0)
      case 'calories_desc': return (b.calories || 0) - (a.calories || 0)
      default: return 0
    }
  })

  const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE)
  const paginated = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  useEffect(() => { setPage(1) }, [search, category, sort])

  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setSort('')
    setPage(1)
  }

  const hasFilters = search || category || sort

  return (
    <>
      <Helmet>
        <title>المينيو — Helthy Bite</title>
        <meta name="description" content="تصفح قائمة الوجبات الصحية من Helthy Bite. كل الوجبات طازة، محسوبة السعرات، ومكونات طبيعية من مزارع محلية." />
        <meta property="og:title" content="المينيو — Helthy Bite" />
        <meta property="og:description" content="تصفح قائمة الوجبات الصحية من Helthy Bite." />
        <meta property="og:image" content="https://helthybite.vercel.app/og-image.svg" />
        <meta property="og:url" content="https://helthybite.vercel.app/menu" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://helthybite.vercel.app/menu" />
      </Helmet>
      <section className="min-h-screen bg-[var(--bg-primary)] pt-[72px]">
        <div className="max-w-[1320px] mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-cairo text-3xl font-bold text-[var(--text-primary)]">المينيو</h1>
              <p className="text-[var(--text-secondary)] text-sm mt-1">كل الوجبات الصحية اللي تحتاجها</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="ابحث عن وجبة..."
                  className="w-56 pr-10 pl-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#237C3C]/30 transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(p => !p)}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${showFilters ? 'bg-[#237C3C] text-white border-[#237C3C]' : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[#237C3C]'}`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters bar */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]"
            >
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--text-primary)]">التصنيف:</span>
                  <div className="flex gap-1 flex-wrap">
                    <button
                      onClick={() => setCategory('')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${!category ? 'bg-[#237C3C] text-white' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[#237C3C]'}`}
                    >
                      الكل
                    </button>
                    {allCategories.map(c => (
                      <button
                        key={c}
                        onClick={() => setCategory(c)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${category === c ? 'bg-[#237C3C] text-white' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[#237C3C]'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--text-primary)]">الترتيب:</span>
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[#237C3C]/30"
                  >
                    {sortOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    إلغاء الفلترة
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Products grid */}
          {loading ? (
            <div className="flex flex-wrap justify-center gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(25%-0.9375rem)] min-w-[250px]">
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap justify-center gap-5">
                {paginated.map((product, i) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                    className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(25%-0.9375rem)] min-w-[250px] bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="h-52 overflow-hidden">
                      <img src={product.image ? API + product.image : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'} alt={product.nameAr} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-cairo font-bold text-lg text-[var(--text-primary)]">{product.nameAr}</h3>
                        <span className="text-xs font-semibold text-[#237C3C] bg-[#E8F5E9] px-3 py-1 rounded-full">
                          {product.calories} سعرة
                        </span>
                      </div>
                      <p className="text-[var(--text-secondary)] text-sm mb-4">{product.descriptionAr || 'وجبة صحية ولذيذة'}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-lg text-[var(--text-primary)]">{product.price} ج.م</span>
                        <Button size="sm" variant="default" onClick={() => addItem(product)} className="gap-1.5">
                          <Plus className="w-4 h-4" />
                          أضف
                        </Button>
                      </div>
                      <button
                        onClick={() => setExpandedReview(expandedReview === product._id ? null : product._id)}
                        className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[#237C3C] transition-colors w-full pt-2 border-t border-[var(--border-color)] cursor-pointer bg-none"
                      >
                        <Star className="w-3.5 h-3.5" />
                        عرض التقييمات
                      </button>
                      {expandedReview === product._id && (
                        <div className="mt-3 pt-3 border-t border-[var(--border-color)] space-y-3">
                          <ReviewList productId={product._id} />
                          {user && (
                            <div className="pt-2 border-t border-[var(--border-color)]">
                              <p className="text-xs font-bold text-[var(--text-primary)] mb-2">أضف تقييمك</p>
                              <ReviewForm productId={product._id} onReviewAdded={() => setExpandedReview(null)} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {paginated.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                    <Search className="w-8 h-8 text-[#237C3C]" />
                  </div>
                  <p className="text-lg text-[var(--text-secondary)]">لا توجد وجبات متاحة</p>
                  {hasFilters && (
                    <button onClick={clearFilters} className="mt-3 text-sm text-[#237C3C] font-bold hover:underline cursor-pointer bg-none border-none">
                      إلغاء الفلترة
                    </button>
                  )}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10" style={{ direction: 'ltr' }}>
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[#237C3C] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                        page === p
                          ? 'bg-[#237C3C] text-white'
                          : 'border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[#237C3C]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[#237C3C] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
