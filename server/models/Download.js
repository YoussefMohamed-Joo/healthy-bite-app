import mongoose from '../mongoose.js'

const downloadSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  device: { type: String, enum: ['android', 'ios'], required: true },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  referrer: { type: String, default: '' },
  country: { type: String, default: '' },
}, { timestamps: true })

downloadSchema.index({ device: 1, createdAt: -1 })
downloadSchema.index({ user: 1 })
downloadSchema.index({ createdAt: -1 })

export default mongoose.model('Download', downloadSchema)
