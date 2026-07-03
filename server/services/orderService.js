import Order from '../models/Order.js'
import Product from '../models/Product.js'
import Coupon from '../models/Coupon.js'
import ApiError from '../utils/ApiError.js'
import { paginate, buildFilter } from '../utils/helpers.js'
import { sendOrderConfirmation, sendStatusUpdate, sendPaymentVerified, sendOrderCancelled } from './emailService.js'

export async function listOrders(query, userId, userRole) {
  const { page, limit, skip } = paginate(query.page, query.limit)
  const filter = buildFilter(query, ['status'])

  if (userRole !== 'admin') filter.user = userId

  const [orders, total] = await Promise.all([
    Order.find(filter).populate('items.product', 'name nameAr price image').sort('-createdAt').skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ])

  return {
    data: orders,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

export async function createOrder(data, userId = null) {
  if (!data.items || data.items.length === 0) throw new ApiError(400, 'Order must have at least one item')
  if (!data.customerName || !data.customerPhone || !data.customerAddress) {
    throw new ApiError(400, 'Customer name, phone, and address are required')
  }

  const productIds = [...new Set(data.items.map(i => i.product))]
  const products = await Product.find({ _id: { $in: productIds }, available: true }).lean()
  const productMap = new Map(products.map(p => [p._id.toString(), p]))

  for (const item of data.items) {
    const dbProduct = productMap.get(item.product)
    if (!dbProduct) throw new ApiError(400, `Product ${item.product} not found or unavailable`)
    item.price = dbProduct.price
    item.name = dbProduct.name
    item.nameAr = dbProduct.nameAr
  }

  const isManualPayment = data.paymentMethod === 'vodafone_cash' || data.paymentMethod === 'fawry'

  const subtotal = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  let discountAmount = 0

  if (data.couponCode) {
    const coupon = await Coupon.findOne({ code: data.couponCode.toUpperCase(), active: true })
    if (coupon) {
      if (!coupon.expiresAt || new Date() <= coupon.expiresAt) {
        if (coupon.maxUses === 0 || coupon.usedCount < coupon.maxUses) {
          if (subtotal >= (coupon.minOrder || 0)) {
            discountAmount = coupon.type === 'percentage'
              ? (subtotal * coupon.discount) / 100
              : coupon.discount
            discountAmount = Math.min(discountAmount, subtotal)
            discountAmount = Math.round(discountAmount * 100) / 100
            coupon.usedCount += 1
            await coupon.save()
          }
        }
      }
    }
  }

  const total = Math.round((subtotal - discountAmount) * 100) / 100

  const orderData = {
    ...data,
    user: userId || undefined,
    total,
    couponCode: data.couponCode || '',
    discountAmount,
  }

  if (isManualPayment) {
    orderData.status = 'payment_pending'
    orderData.paymentInfo = {
      method: data.paymentMethod,
      phoneWallet: data.phoneWallet || '',
      transactionId: data.transactionId || '',
      receiptImage: data.receiptImage || '',
      verified: false,
      rejected: false,
      rejectionReason: '',
    }
  } else {
    orderData.paymentInfo = { method: 'cash', verified: false, rejected: false, rejectionReason: '' }
  }

  const order = await Order.create(orderData)
  const populated = await Order.findById(order._id).populate('items.product', 'name nameAr price image')

  if (data.email) {
    sendOrderConfirmation(populated.toObject(), data.email).catch(() => {})
  }

  return populated
}

export async function updateOrderStatus(id, status, userRole) {
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    payment_pending: ['preparing', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['delivering', 'cancelled'],
    delivering: ['delivered'],
    delivered: [],
    cancelled: [],
    rejected: [],
  }

  const order = await Order.findById(id)
  if (!order) throw new ApiError(404, 'Order not found')

  if (!validTransitions[order.status]?.includes(status)) {
    throw new ApiError(400, `Cannot transition from ${order.status} to ${status}`)
  }

  if (userRole !== 'admin' && status === 'cancelled' && order.status !== 'pending') {
    throw new ApiError(403, 'Can only cancel pending orders')
  }

  order.status = status
  await order.save()

  const populated = await Order.findById(order._id).populate('items.product', 'name nameAr price image')

  if (populated.email && ['confirmed', 'preparing', 'delivering', 'delivered', 'cancelled', 'rejected'].includes(status)) {
    sendStatusUpdate(populated.toObject(), populated.email).catch(() => {})
  }

  return populated
}

export async function verifyPayment(id) {
  const order = await Order.findById(id)
  if (!order) throw new ApiError(404, 'Order not found')
  if (order.status !== 'payment_pending') {
    throw new ApiError(400, 'Order is not awaiting payment verification')
  }

  order.status = 'preparing'
  order.paymentInfo.verified = true
  await order.save()

  const populated = await Order.findById(order._id).populate('items.product', 'name nameAr price image')

  if (populated.email) {
    sendPaymentVerified(populated.toObject(), populated.email).catch(() => {})
  }

  return populated
}

export async function rejectPayment(id, reason) {
  const order = await Order.findById(id)
  if (!order) throw new ApiError(404, 'Order not found')
  if (order.status !== 'payment_pending') {
    throw new ApiError(400, 'Order is not awaiting payment verification')
  }

  order.status = 'rejected'
  order.paymentInfo.rejected = true
  order.paymentInfo.rejectionReason = reason || 'لم يتم توضيح السبب'
  await order.save()

  const populated = await Order.findById(order._id).populate('items.product', 'name nameAr price image')

  if (populated.email) {
    sendOrderCancelled(populated.toObject(), populated.email, reason).catch(() => {})
  }

  return populated
}

export async function getPaymentPendingOrders() {
  const orders = await Order.find({ status: 'payment_pending' })
    .populate('items.product', 'name nameAr price image')
    .sort('-createdAt')
    .lean()
  return orders
}
