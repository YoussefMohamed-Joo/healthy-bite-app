import mongoose from '../mongoose.js'

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  name: { type: String, default: '' },
  nameAr: { type: String, default: '' },
}, { _id: false })

const paymentInfoSchema = new mongoose.Schema({
  method: { type: String, enum: ['vodafone_cash', 'fawry', 'cash', 'card'], default: 'cash' },
  phoneWallet: { type: String, default: '' },
  transactionId: { type: String, default: '' },
  receiptImage: { type: String, default: '' },
  verified: { type: Boolean, default: false },
  rejected: { type: Boolean, default: false },
  rejectionReason: { type: String, default: '' },
}, { _id: false })

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  items: { type: [orderItemSchema], required: true, validate: v => v.length > 0 },
  total: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'payment_pending', 'confirmed', 'preparing', 'delivering', 'delivered', 'cancelled', 'rejected'],
    default: 'pending',
  },
  customerName: { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  customerAddress: { type: String, required: true, trim: true },
  email: { type: String, default: '', trim: true },
  notes: { type: String, default: '', trim: true },
  paymentInfo: { type: paymentInfoSchema, default: () => ({}) },
  paymentIntentId: { type: String, default: '' },
  couponCode: { type: String, default: '' },
  discountAmount: { type: Number, default: 0 },
}, { timestamps: true })

orderSchema.index({ status: 1, createdAt: -1 })
orderSchema.index({ user: 1 })

export default mongoose.model('Order', orderSchema)
