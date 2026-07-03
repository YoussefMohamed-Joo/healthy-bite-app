import mongoose from '../mongoose.js'

const pageVisitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  page: { type: String, required: true },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  referrer: { type: String, default: '' },
  deviceType: { type: String, enum: ['android', 'ios', 'desktop', 'unknown'], default: 'unknown' },
  sessionId: { type: String, default: '' },
}, { timestamps: true })

pageVisitSchema.index({ user: 1, createdAt: -1 })
pageVisitSchema.index({ page: 1, createdAt: -1 })
pageVisitSchema.index({ createdAt: -1 })
pageVisitSchema.index({ sessionId: 1 })

export default mongoose.model('PageVisit', pageVisitSchema)
