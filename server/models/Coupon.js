import mongoose from '../mongoose.js'

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  discount: { type: Number, required: true, min: 0 },
  minOrder: { type: Number, default: 0 },
  maxUses: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date, default: null },
  active: { type: Boolean, default: true },
}, { timestamps: true })

couponSchema.index({ code: 1 })

export default mongoose.model('Coupon', couponSchema)
