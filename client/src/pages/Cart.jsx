import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function Cart() {
  const { items, removeItem, updateQty, total, count } = useCart()

  if (items.length === 0) {
    return (
      <>
        <Helmet>
          <title>عربة التسوق — Helthy Bite</title>
          <meta name="description" content="راجع وجباتك الصحية في عربة التسوق قبل إتمام الطلب من Helthy Bite." />
          <meta property="og:title" content="عربة التسوق — Helthy Bite" />
          <meta property="og:description" content="راجع وجباتك الصحية في عربة التسوق قبل إتمام الطلب." />
          <meta property="og:image" content="https://helthybite.vercel.app/og-image.svg" />
          <meta property="og:url" content="https://helthybite.vercel.app/cart" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <link rel="canonical" href="https://helthybite.vercel.app/cart" />
        </Helmet>
        <section className="min-h-screen bg-zinc-50 pt-[70px]">
          <div className="max-w-[1320px] mx-auto px-6 py-20 text-center">
            <ShoppingBag className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <h2 className="font-cairo text-2xl font-bold text-zinc-900 mb-2">العربة فاضية</h2>
            <p className="text-zinc-500 mb-6">ضيف وجبات صحية من المينيو</p>
            <Link to="/menu"><Button>شوف المينيو</Button></Link>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>عربة التسوق — Helthy Bite</title>
        <meta name="description" content="راجع وجباتك الصحية في عربة التسوق قبل إتمام الطلب من Helthy Bite." />
        <meta property="og:title" content="عربة التسوق — Helthy Bite" />
        <meta property="og:description" content="راجع وجباتك الصحية في عربة التسوق قبل إتمام الطلب." />
        <meta property="og:image" content="https://helthybite.vercel.app/og-image.svg" />
        <meta property="og:url" content="https://helthybite.vercel.app/cart" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://helthybite.vercel.app/cart" />
      </Helmet>
      <section className="min-h-screen bg-zinc-50 pt-[70px]">
        <div className="max-w-[1320px] mx-auto px-6 py-10">
          <h1 className="font-cairo text-3xl font-bold text-zinc-900 mb-8">عربة التسوق ({count})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                className="bg-white rounded-2xl border border-zinc-100 p-4 flex items-center gap-4"
              >
                <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'} alt="" className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-cairo font-bold text-zinc-900">{item.nameAr || item.name}</h3>
                  <p className="text-brand font-bold text-sm">{item.price} $</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQty(item._id, item.quantity - 1)} className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 cursor-pointer">
                    <Minus className="w-3.5 h-3.5 text-zinc-600" />
                  </button>
                  <span className="font-bold text-zinc-900 w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item._id, item.quantity + 1)} className="w-8 h-8 rounded-full border border-zinc-200 flex items-center justify-center hover:bg-zinc-50 cursor-pointer">
                    <Plus className="w-3.5 h-3.5 text-zinc-600" />
                  </button>
                </div>
                <div className="text-left min-w-[80px]">
                  <span className="font-bold text-zinc-900">{(item.price * item.quantity).toFixed(2)} ج.م</span>
                </div>
                <button onClick={() => removeItem(item._id)} className="p-2 hover:bg-red-50 rounded-lg cursor-pointer">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 p-6 h-fit sticky top-24">
            <h3 className="font-cairo font-bold text-lg text-zinc-900 mb-4">ملخص الطلب</h3>
            <div className="space-y-3 mb-4">
              {items.map(i => (
                <div key={i._id} className="flex justify-between text-sm">
                  <span className="text-zinc-600">{i.nameAr || i.name} × {i.quantity}</span>
                  <span className="font-medium text-zinc-900">{(i.price * i.quantity).toFixed(2)} $</span>
                </div>
              ))}
            </div>
            <div className="border-t border-zinc-100 pt-3 flex justify-between mb-6">
              <span className="font-bold text-zinc-900">المجموع</span>
              <span className="font-bold text-lg text-brand">{total.toFixed(2)} ج.م</span>
            </div>
            <Link to="/checkout">
              <Button className="w-full" size="lg">اتابع الطلب</Button>
            </Link>
          </div>
        </div>
      </div>
      </section>
    </>
  )
}
