import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search } from 'lucide-react'

const faqs = [
  { q: 'متى سأستلم توصيل الوجبات الصحية؟', a: 'نوصل الطلبات من ٨ صباحاً لـ ١١ مساءً.可以选择 وقت التوصيل المناسب ليك — هتوصلك خلال ٣٠-٤٥ دقيقة من وقت الطلب.' },
  { q: 'هل يمكنني اختيار وقت توصيل الطعام الصحي؟', a: 'أكيد. تقدر تحدد وقت التوصيل اللي يناسبك أثناء الطلب — هنوصلك في المعاد اللي تختاره بالضبط.' },
  { q: 'ما مدى طزاجة الوجبات الصحية اللي توصلوها؟', a: 'بنحضر الوجبات يومياً من مطبخنا المركزي باستخدام مكونات طازجة بنفس اليوم. مفيش تخزين ولا وجبات مجمدة.' },
  { q: 'ما اللي يميز طعامكم الصحي عن الخدمات التانية؟', a: 'الفرق إن كل وجبة معمولة تحت إشراف أخصائي تغذية، السعرات محسوبة بدقة، والتوصيل مجاني. وطعمها جامد برضه 😉' },
  { q: 'هل توصلون الطعام الصحي إلى القاهرة الجديدة والتجمع الخامس؟', a: 'بنوصل لكل مناطق القاهرة الكبرى، التجمع، القاهرة الجديدة، الشيخ زايد، ٦ أكتوبر، والمعادي. بنوّع نطاق التوصيل باستمرار.' },
  { q: 'أين أجد مطاعم صحية في القاهرة الجديدة تقدم خدمة التوصيل؟', a: 'HealthyBite مش مطعم تقليدي — احنا خدمة تحضير وتوصيل وجبات صحية. بنوصل لكل القاهرة الجديدة والتجمع، من غير ما تضطر تطلب من مطاعم متفرقة.' },
  { q: 'ما هو الميل بريب وكيف يعمل؟', a: 'الميل بريب (Meal Prep) هو نظام تحضير الوجبات مسبقاً. احنا بنحضر الوجبات freshly لكل يوم، بتختار الوجبات اللي تعجبك، واحنا بنوصلها لباب بيتك.' },
  { q: 'إيه الفرق بين HealthyBite وخدمات الدايت التانية؟', a: 'HealthyBite مش بس وجبات دايت — احنا نقدم وجبات متكاملة بطعم جامد، سعرات محسوبة، مكونات طبيعية ١٠٠٪. وبنوصل لكل مكان.' },
  { q: 'إزاي أقدر أكل صحي في مصر مع جدول مشغول؟', a: 'سهل — اطلب من HealthyBite. هتختار الوجبات من المينيو واحنا هنوصلها لك مكتبك أو بيتك. توفير وقت، مجهود، وضمان أكلك صحي.' },
  { q: 'ما خيارات الطعام الصحي اللي تقدمونها للغداء؟', a: 'عندنا باور بول، بروتين بليت، جرين جوديس، سلطة سيزر، فلافل بول، توست أفوكادو، ومانجو بول. كلها طازة ومحضرة بنفس اليوم.' },
  { q: 'ما هي سياسة الإلغاء لتوصيل الوجبات الصحية؟', a: 'تقدر تلغي الطلب مجاناً خلال ١٥ دقيقة من الطلب. بعد كده بنكون بدأنا التحضير، فمينفعش الإلغاء.' },
  { q: 'هل تراعون القيود الغذائية والحساسية؟', a: 'طبعاً 👌 بنكتب مكونات كل وجبة بالتفصيل، وتقدر تطلب تعديلات أو تستشير أخصائي التغذية بتاعنا قبل الطلب.' },
  { q: 'كم تكلفة توصيل الوجبات الصحية؟', a: 'التوصيل مجاني للطلبات فوق ١٠٠ جنيه. للطلبات الأقل، التوصيل ٢٠ جنيه فقط.' },
  { q: 'ليه أختار HealthyBite لتوصيل الطعام الصحي؟', a: 'وجبات طازة يومياً، سعرات محسوبة بدقة، مكونات طبيعية، توصيل مجاني وسريع، وطعم جامد مش هتحس إنك على دايت.' },
  { q: 'ما المناطق اللي بتغطوها لتوصيل الوجبات الصحية؟', a: 'القاهرة، الجيزة، القاهرة الجديدة، التجمع، الشيخ زايد، ٦ أكتوبر، المعادي، مدينة نصر، مصر الجديدة، وبني سويف.' },
  { q: 'هل يمكنني طلب وجبات صحية لمكتبي في القاهرة؟', a: 'أكيد — بنوصل لمكاتب وشركات في كل مناطق القاهرة. تقدر تعمل طلب منتظم لمكتبك كل يوم.' },
  { q: 'تغطية التوصيل', a: 'نوصل الوجبات الطازجة في جميع أنحاء القاهرة الكبرى، الجيزة، القاهرة الجديدة، التجمع الخامس، الشيخ زايد، ٦ أكتوبر، المعادي، مدينة نصر، مصر الجديدة، وبني سويف. بنوسع التغطية باستمرار.' },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = faqs.filter(f =>
    f.q.includes(search) || f.a.includes(search)
  )

  return (
    <section className="min-h-screen bg-zinc-50 pt-[70px]">
      <div className="max-w-[800px] mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <h1 className="font-cairo text-3xl md:text-4xl font-bold text-zinc-900 mb-3">الأسئلة الشائعة</h1>
          <p className="text-zinc-500 text-base">كل ما تحتاج معرفته عن توصيل الوجبات الصحية في مصر.</p>
        </div>

        <div className="relative mb-10">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في الأسئلة..."
            className="w-full pr-12 pl-4 py-3.5 rounded-2xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 shadow-sm"
          />
        </div>

        <div className="space-y-3">
          {filtered.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.02 } }}
              className="bg-white rounded-2xl border border-zinc-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-right cursor-pointer"
              >
                <span className="font-cairo font-bold text-zinc-900 text-sm md:text-base leading-relaxed ml-4">
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === i ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown className="w-5 h-5 text-zinc-400" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-zinc-600 text-sm leading-relaxed border-t border-zinc-50 pt-3">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-zinc-400">
            <p className="text-lg">مفيش نتائج لبحثك</p>
          </div>
        )}
      </div>
    </section>
  )
}
