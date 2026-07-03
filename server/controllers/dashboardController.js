import Order from '../models/Order.js'
import User from '../models/User.js'
import catchAsync from '../utils/catchAsync.js'

export const getRevenueChart = catchAsync(async (req, res) => {
  const now = new Date()
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const end = new Date(start.getTime() + 86400000)
    days.push({ start, end, label: d.toLocaleDateString('ar-EG', { weekday: 'short' }) })
  }

  const chartData = await Promise.all(
    days.map(async (day) => {
      const result = await Order.aggregate([
        { $match: { status: 'delivered', createdAt: { $gte: day.start, $lt: day.end } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ])
      return { label: day.label, revenue: result[0]?.total || 0 }
    })
  )

  // Monthly comparison
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const [thisMonth, lastMonth] = await Promise.all([
    Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: thisMonthStart, $lt: nextMonthStart } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
  ])

  res.json({
    status: 'success',
    data: {
      weekly: chartData,
      thisMonth: thisMonth[0]?.total || 0,
      lastMonth: lastMonth[0]?.total || 0,
    },
  })
})

export const getAnalytics = catchAsync(async (req, res) => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 86400000)

  const [todayRevenue, pendingOrders, activeUsers] = await Promise.all([
    Order.aggregate([
      { $match: { status: 'delivered', createdAt: { $gte: todayStart, $lt: todayEnd } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]),
    Order.countDocuments({ status: 'pending' }),
    User.countDocuments({ role: 'client', active: true }),
  ])

  res.json({
    status: 'success',
    data: {
      todayRevenue: todayRevenue[0]?.total || 0,
      pendingOrders,
      activeUsers,
    },
  })
})
