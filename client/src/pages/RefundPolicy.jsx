import { Helmet } from 'react-helmet-async'

export default function RefundPolicy() {
  return (
    <>
      <Helmet>
        <title>سياسة الإلغاء والاسترجاع — Helthy Bite</title>
        <meta name="description" content="سياسة الإلغاء والاسترجاع لـ Helthy Bite — تعرف على شروط إلغاء الطلب واسترداد المبلغ." />
        <meta property="og:title" content="سياسة الإلغاء والاسترجاع — Helthy Bite" />
        <meta property="og:description" content="سياسة الإلغاء والاسترجاع لـ Helthy Bite." />
        <meta property="og:image" content="https://helthybite.vercel.app/og-image.svg" />
        <meta property="og:url" content="https://helthybite.vercel.app/refund-policy" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://helthybite.vercel.app/refund-policy" />
      </Helmet>
      <section className="min-h-screen bg-zinc-50 pt-[70px]">
        <div className="max-w-[700px] mx-auto px-6 py-12">
          <h1 className="font-cairo text-3xl font-bold text-zinc-900 mb-2">سياسة الإلغاء والاسترجاع</h1>
        <p className="text-zinc-500 text-sm mb-8">آخر تحديث: يوليو 2026</p>

        <div className="bg-white rounded-2xl border border-zinc-100 p-8 space-y-6 text-zinc-600 text-sm leading-relaxed">
          <section>
            <h2 className="font-cairo font-bold text-zinc-900 text-lg mb-3">١. إلغاء الطلب</h2>
            <p>يمكنك إلغاء الطلب في الحالات التالية:</p>
            <ul className="list-disc pr-5 mt-2 space-y-1">
              <li>الطلب لا يزال بحالة "قيد الانتظار" — يمكن الإلغاء مباشرة من حسابك</li>
              <li>الطلب بحالة "في انتظار تأكيد الدفع" — يمكن الإلغاء وسيتم إلغاء عملية الدفع</li>
              <li>بعد بدء تجهيز الطلب — لا يمكن الإلغاء</li>
            </ul>
          </section>

          <section>
            <h2 className="font-cairo font-bold text-zinc-900 text-lg mb-3">٢. استرداد المبلغ</h2>
            <p>في حالة إلغاء الطلب قبل التجهيز:</p>
            <ul className="list-disc pr-5 mt-2 space-y-1">
              <li>الدفع عند الاستلام: لا يوجد استرداد مطلوب</li>
              <li>الدفع الإلكتروني (Stripe): يتم استرداد المبلغ تلقائياً خلال ٥-١٠ أيام عمل</li>
              <li>فودافون كاش / فوري: يتم تحويل المبلغ خلال ٢٤ ساعة</li>
            </ul>
          </section>

          <section>
            <h2 className="font-cairo font-bold text-zinc-900 text-lg mb-3">٣. مشاكل الطلب</h2>
            <p>إذا استلمت طلباً به مشكلة (نقص في المنتجات، تلف، خطأ)، يرجى التواصل معنا خلال ٢٤ ساعة من الاستلام مع صورة توضيحية وسيتم التعويض أو إعادة الطلب.</p>
          </section>

          <section>
            <h2 className="font-cairo font-bold text-zinc-900 text-lg mb-3">٤. رفض الطلب من الإدارة</h2>
            <p>في حال رفض الطلب من قبل الإدارة (لأسباب مثل عدم توفر المنتجات أو مشكلة في الدفع)، سيتم إشعارك بالسبب وإلغاء أي مبالغ مدفوعة.</p>
          </section>

          <section>
            <h2 className="font-cairo font-bold text-zinc-900 text-lg mb-3">٥. حالات لا تشملها سياسة الاسترجاع</h2>
            <ul className="list-disc pr-5 mt-2 space-y-1">
              <li>عدم رضا عن الطعم أو المذاق</li>
              <li>تغير الرأي بعد تجهيز الطلب</li>
              <li>عدم التواجد في العنوان عند التوصيل</li>
            </ul>
          </section>
        </div>
      </div>
      </section>
    </>
  )
}
