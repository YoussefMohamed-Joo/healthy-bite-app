import Order from '../models/Order.js'
import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import { paginate, buildFilter } from '../utils/helpers.js'

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

  const order = await Order.create({
    ...data,
    user: userId || undefined,
    total: data.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  })

  const populated = await Order.findById(order._id).populate('items.product', 'name nameAr price image')
  return populated
}

export async function updateOrderStatus(id, status, userRole) {
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['delivering', 'cancelled'],
    delivering: ['delivered'],
    delivered: [],
    cancelled: [],
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
  return populated
}
