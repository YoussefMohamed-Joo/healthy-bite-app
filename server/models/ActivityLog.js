import mongoose from '../mongoose.js'

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: { type: String, default: '' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
}, { timestamps: true })

activitySchema.index({ user: 1, createdAt: -1 })

export default mongoose.model('ActivityLog', activitySchema)
