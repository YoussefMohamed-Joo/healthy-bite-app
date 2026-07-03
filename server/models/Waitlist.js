import mongoose from 'mongoose'

const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  device: {
    type: String,
    enum: ['android', 'ios'],
    default: 'android',
  },
  createdAt: { type: Date, default: Date.now },
})

waitlistSchema.index({ email: 1 }, { unique: true })

export default mongoose.model('Waitlist', waitlistSchema)
