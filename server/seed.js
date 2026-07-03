import mongoose from 'mongoose'
import User from './models/User.js'
import Product from './models/Product.js'
import Plan from './models/Plan.js'
import Testimonial from './models/Testimonial.js'
import Faq from './models/Faq.js'
import SiteSetting from './models/SiteSetting.js'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/healthybite'

const products = [
  { name: 'Power Bowl', nameAr: 'باور بول', price: 13.90, calories: 420, description: 'Quinoa, sweet potato, avocado, chickpea, tahini', descriptionAr: 'كينوا، بطاطا حلوة، أفوكادو، حمص، صلصة طحينة', category: 'main', rating: 4.8 },
  { name: 'Green Goddess', nameAr: 'جرين جوديس', price: 11.90, calories: 310, description: 'Kale, spinach, edamame, cucumber, avocado', descriptionAr: 'كرنب، سبانخ، إدامامي، خيار، أفوكادو', category: 'salad', rating: 4.9 },
  { name: 'Protein Plate', nameAr: 'بروتين بليت', price: 15.90, calories: 520, description: 'Grilled chicken, brown rice, broccoli, ginger sauce', descriptionAr: 'دجاج مشوي، أرز بني، بروكلي، صلصة زنجبيل', category: 'main', rating: 4.7 },
  { name: 'Berry Smoothie', nameAr: 'بيري سموذي', price: 7.90, calories: 180, description: 'Mixed berries, banana, greek yogurt, honey', descriptionAr: 'توت مشكل، موز، زبادي يوناني، عسل', category: 'drink', rating: 4.6 },
  { name: 'Falafel Bowl', nameAr: 'فلافل بول', price: 10.90, calories: 380, description: 'Falafel, hummus, mixed veggies, tahini sauce', descriptionAr: 'فلافل، حمص، خضار مشكلة، صلصة طحينة', category: 'main', rating: 4.5 },
  { name: 'Avocado Toast', nameAr: 'توست أفوكادو', price: 9.90, calories: 290, description: 'Brown bread, avocado, tomato, boiled egg', descriptionAr: 'خبز أسمر، أفوكادو، طماطم، بيض مسلوق', category: 'snack', rating: 4.4 },
  { name: 'Mango Bowl', nameAr: 'مانجو بول', price: 12.90, calories: 350, description: 'Fresh mango, coconut, chia seeds, granola', descriptionAr: 'مانجو طازج، جوز هند، بذور شيا، جرانولا', category: 'main', rating: 4.7 },
  { name: 'Caesar Salad', nameAr: 'سلطة سيزر', price: 10.90, calories: 270, description: 'Romaine, parmesan, croutons, grilled chicken', descriptionAr: 'خس رومين، بارميزان، خبز محمص، دجاج مشوي', category: 'salad', rating: 4.3 },
]

const plans = [
  { name: 'Bulking', nameAr: 'تضخيم', price: 850, descriptionAr: 'وجبات عالية السعرات والبروتين لبناء العضلات', features: ['٢٥٠٠-٣٠٠٠ سعرة/يوم', 'بروتين عالي', 'كربوهيدرات معقدة', 'دهون صحية', 'توصيل مجاني'], popular: false },
  { name: 'Maintenance', nameAr: 'محافظة', price: 750, descriptionAr: 'وجبات متوازنة تناسب أسلوب حياتك اليومي', features: ['٢٠٠٠-٢٢٠٠ سعرة/يوم', 'بروتين متوسط', 'نشويات متوازنة', 'خضار طازج', 'توصيل مجاني'], popular: true },
  { name: 'Weight Loss', nameAr: 'تنحيف', price: 650, descriptionAr: 'وجبات منخفضة السعرات لإنقاص الوزن بفاعلية', features: ['١٢٠٠-١٥٠٠ سعرة/يوم', 'بروتين عالي', 'دهون قليلة', 'ألياف طبيعية', 'توصيل مجاني'], popular: false },
]

const faqs = [
  { question: 'متى سأستلم توصيل الوجبات الصحية؟', answer: 'نوصل الطلبات من ٨ صباحاً لـ ١١ مساءً. تقدر تحدد وقت التوصيل المناسب ليك — هتوصلك خلال ٣٠-٤٥ دقيقة من وقت الطلب.', order: 1 },
  { question: 'هل يمكنني اختيار وقت توصيل الطعام الصحي؟', answer: 'أكيد. تقدر تحدد وقت التوصيل اللي يناسبك أثناء الطلب — هنوصلك في المعاد اللي تختاره بالضبط.', order: 2 },
  { question: 'ما مدى طزاجة الوجبات الصحية اللي توصلوها؟', answer: 'بنحضر الوجبات يومياً من مطبخنا المركزي باستخدام مكونات طازجة بنفس اليوم. مفيش تخزين ولا وجبات مجمدة.', order: 3 },
  { question: 'ما اللي يميز طعامكم الصحي عن الخدمات التانية؟', answer: 'الفرق إن كل وجبة معمولة تحت إشراف أخصائي تغذية، السعرات محسوبة بدقة، والتوصيل مجاني.', order: 4 },
  { question: 'هل توصلون الطعام الصحي لكل مناطق بني سويف؟', answer: 'بنوصل لكل مناطق بني سويف — وسط المدينة، بياض العرب، إهناسيا، الفشن، الواسطى، وكل القرى المجاورة.', order: 5 },
  { question: 'ما خيارات الطعام الصحي اللي تقدمونها للغداء؟', answer: 'عندنا باور بول، بروتين بليت، جرين جوديس، سلطة سيزر، فلافل بول، توست أفوكادو، ومانجو بول. كلها طازة ومحضرة بنفس اليوم.', order: 6 },
  { question: 'ما هي سياسة الإلغاء لتوصيل الوجبات الصحية؟', answer: 'تقدر تلغي الطلب مجاناً خلال ١٥ دقيقة من الطلب. بعد كده بنكون بدأنا التحضير، فمينفعش الإلغاء.', order: 7 },
  { question: 'هل تراعون القيود الغذائية والحساسية؟', answer: 'طبعاً 👌 بنكتب مكونات كل وجبة بالتفصيل، وتقدر تطلب تعديلات أو تستشير أخصائي التغذية بتاعنا قبل الطلب.', order: 8 },
  { question: 'كم تكلفة توصيل الوجبات الصحية؟', answer: 'التوصيل مجاني للطلبات فوق ١٠٠ جنيه. للطلبات الأقل، التوصيل ٢٠ جنيه فقط.', order: 9 },
  { question: 'ما المناطق اللي بتغطوها لتوصيل الوجبات الصحية؟', answer: 'بني سويف، وسط المدينة، بياض العرب، إهناسيا، الفشن، الواسطى، ناصر، وكل القرى المجاورة.', order: 10 },
  { question: 'هل يمكنني طلب وجبات صحية لمكتبي في بني سويف؟', answer: 'أكيد — بنوصل لمكاتب وشركات في كل مناطق بني سويف. تقدر تعمل طلب منتظم لمكتبك كل يوم.', order: 11 },
  { question: 'ليه أختار HealthyBite لتوصيل الطعام الصحي؟', answer: 'وجبات طازة يومياً، سعرات محسوبة بدقة، مكونات طبيعية، توصيل مجاني وسريع، وطعم جامد مش هتحس إنك على دايت.', order: 12 },
]

const siteSettings = [
  {
    key: 'hero_features',
    label: 'ميزات الهيرو',
    value: [
      { text: 'وجبات طازة يومياً' },
      { text: 'سعرات محسوبة بدقة' },
      { text: 'توصيل مجاني لباب البيت' },
    ],
  },
  {
    key: 'about_values',
    label: 'قيم الصفحة التعريفية',
    value: [
      { icon: 'Leaf', title: 'مكونات طبيعية', desc: 'كل مكوناتنا طبيعية ١٠٠%، من مزارع موثوقة، بدون مواد حافظة أو إضافات صناعية.' },
      { icon: 'Sparkles', title: 'طاهٍ محترف', desc: 'فريق الطهاة عندنا بيتمتع بخبرة ١٠ سنين في المطاعم والفنادق. كل وجبة بتخرج بإتقان.' },
      { icon: 'Shield', title: 'سعرات محسوبة', desc: 'كل وجبة محسوبة السعرات بدقة عشان تظبط أكلك من غير ما تفكر. احنا وراك.' },
      { icon: 'Heart', title: 'عشق للصحة', desc: 'مهمتنا إننا نغير مفهوم الأكل الصحي في مصر. أكل صحي مش معناه طعم وحش!' },
    ],
  },
  {
    key: 'contact_info',
    label: 'معلومات التواصل',
    value: [
      { icon: 'Phone', label: 'اتصل بنا', value: '01033558125', desc: 'من ٩ ص لـ ١٠ م' },
      { icon: 'Mail', label: 'البريد الإلكتروني', value: 'hello@healthybite.com', desc: 'نرد خلال ٢٤ ساعة' },
      { icon: 'MapPin', label: 'العنوان', value: 'بني سويف، مصر', desc: 'وسط المدينة، خدمة العملاء' },
      { icon: 'Clock', label: 'مواعيد العمل', value: 'يوميًا من ٩ صباحًا', desc: 'لـ ١١ مساءً — الجمعة ١٢-٩' },
    ],
  },
]

const deliverySeed = [
  {
    key: 'delivery_settings',
    label: 'إعدادات التوصيل',
    value: [
      { key: 'delivery_fee', value: '20', desc: 'رسوم التوصيل (جنيه)' },
      { key: 'free_delivery_min', value: '100', desc: 'الحد الأدنى للطلب للتوصيل المجاني (جنيه)' },
      { key: 'min_order', value: '30', desc: 'الحد الأدنى لأي طلب (جنيه)' },
      { key: 'working_hours', value: '٩ صباحاً - ١١ مساءً', desc: 'مواعيد العمل' },
      { key: 'delivery_time', value: '٣٠-٤٥ دقيقة', desc: 'الوقت التقريبي للتوصيل' },
    ],
  },
]

const testimonials = [
  { name: 'محمد علي', rating: 5, text: 'بصراحة أنا جربت كتير قبل كده، بس HealthyBite حاجة تانية. الأكل طازة والطعم جامد. نزلت ٨ كيلو في شهرين من غير حرمان!', avatar: 'https://i.pravatar.cc/100?img=11' },
  { name: 'سارة أحمد', rating: 5, text: 'التوصيل بيجى في المعاد بالظبط، والتغليف حلو والوجبات مكتوب عليها السعرات. مثالية للي عايز يظبط أكله من غير تعب.', avatar: 'https://i.pravatar.cc/100?img=9' },
  { name: 'خالد يوسف', rating: 4, text: 'خطة التضخيم عندهم ممتازة. الوجبات كتيرة وسعراتها عالية وبروتين نظيف. جربت كتير بس دول الأفضل.', avatar: 'https://i.pravatar.cc/100?img=12' },
  { name: 'نورا محمد', rating: 5, text: 'أفضل حاجة إن فيه خيارات كتير وكل يوم تقدر تختار اللي يناسبك. خدمة العملاء محترمة وسريعة.', avatar: 'https://i.pravatar.cc/100?img=5' },
]

async function seed() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB')

  const admin = await User.findOne({ email: 'admin@healthybite.com' })
  if (!admin) {
    await User.create({ name: 'Admin', email: 'admin@healthybite.com', password: 'admin123', role: 'admin' })
    console.log('✓ Admin created: admin@healthybite.com / admin123')
  }

  const demo = await User.findOne({ email: 'user@demo.com' })
  if (!demo) {
    await User.create({ name: 'Demo User', email: 'user@demo.com', password: 'demo123', role: 'client' })
    console.log('✓ Demo user created: user@demo.com / demo123')
  }

  const productCount = await Product.countDocuments()
  if (productCount === 0) {
    const seeded = await Product.insertMany(products)
    await Product.updateMany({ _id: { $in: [seeded[0]._id, seeded[1]._id, seeded[2]._id, seeded[4]._id] } }, { featured: true })
    console.log(`✓ ${products.length} products seeded (4 featured)`)
  }

  const planCount = await Plan.countDocuments()
  if (planCount === 0) { await Plan.insertMany(plans); console.log(`✓ ${plans.length} plans seeded`) }

  const testimonialCount = await Testimonial.countDocuments()
  if (testimonialCount === 0) { await Testimonial.insertMany(testimonials); console.log(`✓ ${testimonials.length} testimonials seeded`) }

  const faqCount = await Faq.countDocuments()
  if (faqCount === 0) { await Faq.insertMany(faqs); console.log(`✓ ${faqs.length} FAQs seeded`) }

  const settingCount = await SiteSetting.countDocuments()
  if (settingCount === 0) { await SiteSetting.insertMany([...siteSettings, ...deliverySeed]); console.log(`✓ ${siteSettings.length + deliverySeed.length} site settings seeded`) }

  await mongoose.disconnect()
  console.log('Seed complete!')
}

seed().catch((err) => { console.error(err); process.exit(1) })
