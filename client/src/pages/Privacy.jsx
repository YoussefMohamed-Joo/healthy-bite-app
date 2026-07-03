export default function Privacy() {
  return (
    <section className="min-h-screen bg-zinc-50 pt-[70px]">
      <div className="max-w-[700px] mx-auto px-6 py-12">
        <h1 className="font-cairo text-3xl font-bold text-zinc-900 mb-2">سياسة الخصوصية</h1>
        <p className="text-zinc-500 text-sm mb-8">آخر تحديث: يوليو 2026</p>

        <div className="bg-white rounded-2xl border border-zinc-100 p-8 space-y-6 text-zinc-600 text-sm leading-relaxed">
          <section>
            <h2 className="font-cairo font-bold text-zinc-900 text-lg mb-3">١. البيانات التي نجمعها</h2>
            <p>نجمع البيانات التالية عند استخدامك للموقع:</p>
            <ul className="list-disc pr-5 mt-2 space-y-1">
              <li>الاسم ورقم الهاتف والعنوان (لإتمام الطلب)</li>
              <li>البريد الإلكتروني (لإرسال إشعارات الطلب)</li>
              <li>سجل الطلبات (لتحسين الخدمة)</li>
              <li>معلومات الدفع (لا نخزن بيانات البطاقات البنكية)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-cairo font-bold text-zinc-900 text-lg mb-3">٢. كيفية استخدام بياناتك</h2>
            <p>نستخدم بياناتك من أجل:</p>
            <ul className="list-disc pr-5 mt-2 space-y-1">
              <li>معالجة وتوصيل الطلبات</li>
              <li>التواصل معك بخصوص طلبك</li>
              <li>تحسين خدماتنا</li>
              <li>إرسال عروض ترويجية (بموافقتك فقط)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-cairo font-bold text-zinc-900 text-lg mb-3">٣. حماية البيانات</h2>
            <p>جميع البيانات الحساسة مشفرة باستخدام AES-256-CBC. نستخدم HTTPS و JWT مع تشفير RS256 لتأمين الاتصالات.</p>
          </section>

          <section>
            <h2 className="font-cairo font-bold text-zinc-900 text-lg mb-3">٤. حقوقك</h2>
            <p>لديك الحق في:</p>
            <ul className="list-disc pr-5 mt-2 space-y-1">
              <li>طلب نسخة من بياناتك الشخصية</li>
              <li>طلب حذف بياناتك نهائياً</li>
              <li>تصحيح أي بيانات غير صحيحة</li>
              <li>إلغاء الاشتراك في الرسائل التسويقية</li>
            </ul>
          </section>

          <section>
            <h2 className="font-cairo font-bold text-zinc-900 text-lg mb-3">٥. مشاركة البيانات</h2>
            <p>نحن لا نبيع بياناتك لأطراف ثالثة. قد نشارك بياناتك مع شركاء التوصيل لتوصيل الطلبات فقط.</p>
          </section>

          <section>
            <h2 className="font-cairo font-bold text-zinc-900 text-lg mb-3">٦. التعديلات</h2>
            <p>قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنشعرك بالتغييرات الجوهرية عبر الإيميل.</p>
          </section>

          <section>
            <h2 className="font-cairo font-bold text-zinc-900 text-lg mb-3">٧. التواصل</h2>
            <p>للاستفسارات المتعلقة بالخصوصية، يرجى التواصل عبر البريد الإلكتروني: bookbeacon.books@gmail.com</p>
          </section>
        </div>
      </div>
    </section>
  )
}
