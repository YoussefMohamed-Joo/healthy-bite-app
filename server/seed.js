import mongoose from 'mongoose'
import User from './models/User.js'
import Product from './models/Product.js'

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

async function seed() {
  await mongoose.connect(MONGO_URI)
  console.log('Connected to MongoDB')

  // Admin
  const admin = await User.findOne({ email: 'admin@healthybite.com' })
  if (!admin) {
    await User.create({ name: 'Admin', email: 'admin@healthybite.com', password: 'admin123', role: 'admin' })
    console.log('✓ Admin created: admin@healthybite.com / admin123')
  } else {
    console.log('→ Admin already exists')
  }

  // Demo user
  const demo = await User.findOne({ email: 'user@demo.com' })
  if (!demo) {
    await User.create({ name: 'Demo User', email: 'user@demo.com', password: 'demo123', role: 'user' })
    console.log('✓ Demo user created: user@demo.com / demo123')
  } else {
    console.log('→ Demo user already exists')
  }

  // Products
  const count = await Product.countDocuments()
  if (count === 0) {
    await Product.insertMany(products)
    console.log(`✓ ${products.length} products seeded`)
  } else {
    console.log(`→ ${count} products already exist`)
  }

  await mongoose.disconnect()
  console.log('Seed complete!')
}

seed().catch((err) => { console.error(err); process.exit(1) })
