import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
  unreadAdmin: { type: Number, default: 0 },
  unreadUser: { type: Number, default: 0 },
}, { timestamps: true })

chatSchema.index({ user: 1 })
chatSchema.index({ status: 1, lastMessageAt: -1 })

export default mongoose.model('Chat', chatSchema)
