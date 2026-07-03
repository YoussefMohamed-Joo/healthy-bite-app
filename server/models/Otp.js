import mongoose from '../mongoose.js'
const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ['email_verification', 'password_reset'], default: 'email_verification' },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
}, { timestamps: true })
otpSchema.index({ email: 1, createdAt: -1 })
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
export default mongoose.model('Otp', otpSchema)
