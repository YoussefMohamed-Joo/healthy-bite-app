import mongoose from '../mongoose.js'
import argon2 from 'argon2'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  passwordAlgo: { type: String, enum: ['argon2id', 'bcrypt'], default: 'argon2id' },
  role: { type: String, enum: ['client', 'admin'], default: 'client' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  active: { type: Boolean, default: true },
  sessions: [{
    sessionId: { type: String, required: true },
    device: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true })

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  if (this.password.startsWith('$argon2id$')) return next()
  this.password = await argon2.hash(this.password, { type: argon2.argon2id, timeCost: 3, memoryCost: 65536, parallelism: 4 })
  this.passwordAlgo = 'argon2id'
  next()
})

userSchema.methods.comparePassword = async function (candidate) {
  if (this.passwordAlgo === 'argon2id') {
    const match = await argon2.verify(this.password, candidate)
    if (match) return true
  }
  try {
    const bcryptMatch = await bcrypt.compare(candidate, this.password)
    if (bcryptMatch) {
      this.password = candidate
      this.passwordAlgo = 'argon2id'
      await this.save()
      return true
    }
  } catch { /* not a bcrypt hash */ }
  return false
}

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  delete obj.passwordAlgo
  return obj
}

userSchema.index({ email: 1 })

export default mongoose.model('User', userSchema)
