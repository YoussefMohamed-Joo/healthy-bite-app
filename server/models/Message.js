import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  sender: { type: String, enum: ['user', 'admin'], required: true },
  text: { type: String, default: '' },
  type: { type: String, enum: ['text', 'image'], default: 'text' },
  image: { type: String, default: null },
  read: { type: Boolean, default: false },
}, { timestamps: true })

messageSchema.index({ chat: 1, createdAt: 1 })

export default mongoose.model('Message', messageSchema)
