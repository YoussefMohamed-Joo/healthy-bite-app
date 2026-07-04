import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  userName: { type: String, default: '' },
  userEmail: { type: String, default: '' },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
}, { timestamps: true })

conversationSchema.index({ status: 1, updatedAt: -1 })

const messageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  senderRole: { type: String, enum: ['user', 'admin'], default: 'user' },
  content: { type: String, default: '' },
}, { timestamps: true })

messageSchema.index({ conversationId: 1, createdAt: 1 })

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema)
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema)
