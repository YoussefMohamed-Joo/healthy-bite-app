import mongoose from '../mongoose.js'

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
}, { timestamps: true })

faqSchema.index({ order: 1 })
faqSchema.index({ active: 1 })

export default mongoose.model('Faq', faqSchema)
