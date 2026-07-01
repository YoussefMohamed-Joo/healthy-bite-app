import mongoose from 'mongoose'

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameAr: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  calories: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
  description: { type: String, default: '' },
  descriptionAr: { type: String, default: '' },
  category: { type: String, enum: ['main', 'salad', 'drink', 'snack'], default: 'main' },
  available: { type: Boolean, default: true },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
}, { timestamps: true })

productSchema.index({ category: 1, available: 1 })
productSchema.index({ name: 'text', nameAr: 'text' })

export default mongoose.model('Product', productSchema)
