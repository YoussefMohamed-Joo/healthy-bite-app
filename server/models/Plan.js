import mongoose from '../mongoose.js'

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameAr: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },
  descriptionAr: { type: String, default: '' },
  features: [{ type: String }],
  popular: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Plan', planSchema)
