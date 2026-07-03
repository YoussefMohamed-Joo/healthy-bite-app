import User from '../models/User.js'
import Order from '../models/Order.js'
import catchAsync from '../utils/catchAsync.js'

export const listCustomers = catchAsync(async (req, res) => {
  const users = await User.find({ role: 'client' }).sort('-createdAt').lean()

  const customers = await Promise.all(
    users.map(async (u) => {
      const [orders, totalSpent] = await Promise.all([
        Order.countDocuments({ user: u._id }),
        Order.aggregate([
          { $match: { user: u._id, status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
      ])
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        address: u.address,
        active: u.active,
        sessionsCount: u.sessions?.length || 0,
        orderCount: orders,
        totalSpent: totalSpent[0]?.total || 0,
        createdAt: u.createdAt,
      }
    })
  )

  res.json({ status: 'success', data: customers })
})

export const listNewRegistrations = catchAsync(async (req, res) => {
  const since = req.query.since || new Date(0).toISOString()
  const users = await User.find({ role: 'client', createdAt: { $gt: new Date(since) } })
    .select('name email phone createdAt')
    .sort('-createdAt')
    .lean()
  res.json({ status: 'success', data: users })
})

export const getCustomerOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({ user: req.params.id })
    .populate('items.product', 'name nameAr price image')
    .sort('-createdAt')
    .lean()

  res.json({ status: 'success', data: orders })
})
