import User from '../models/User.js'
import Order from '../models/Order.js'
import Download from '../models/Download.js'
import PageVisit from '../models/PageVisit.js'
import catchAsync from '../utils/catchAsync.js'

export const listCustomers = catchAsync(async (req, res) => {
  const users = await User.find({ role: 'client' }).sort('-createdAt').lean()

  const customers = await Promise.all(
    users.map(async (u) => {
      const [orders, totalSpent, downloadCount] = await Promise.all([
        Order.countDocuments({ user: u._id }),
        Order.aggregate([
          { $match: { user: u._id, status: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$total' } } },
        ]),
        Download.countDocuments({ user: u._id }),
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
        downloadCount,
        registrationDevice: u.registrationDevice || '',
        lastLoginIp: u.lastLoginIp || '',
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

export const getCustomerDetails = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).lean()
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' })

  const [orders, activities, downloads, pageVisits] = await Promise.all([
    Order.find({ user: user._id }).sort('-createdAt').lean(),
    (await import('../models/ActivityLog.js')).default.find({ user: user._id }).sort('-createdAt').lean(),
    Download.find({ user: user._id }).sort('-createdAt').lean(),
    PageVisit.find({ user: user._id }).sort('-createdAt').limit(50).lean(),
  ])

  const ipHistory = [
    ...new Set([
      ...(user.sessions || []).map(s => s.ip).filter(Boolean),
      user.registrationIp,
      user.lastLoginIp,
      ...downloads.map(d => d.ip).filter(Boolean),
      ...pageVisits.map(p => p.ip).filter(Boolean),
    ].filter(Boolean)),
  ]

  const totalSpent = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0)

  const orderCount = orders.length
  const downloadCount = downloads.length

  const deviceHistory = [
    ...new Set([
      user.registrationDevice,
      user.lastLoginDevice,
      ...(user.devices || []),
      ...downloads.map(d => d.device),
    ].filter(Boolean)),
  ]

  const uniqueIps = [...new Set(ipHistory)]
  const suspiciousLogin = uniqueIps.length > 2

  res.json({
    status: 'success',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      active: user.active,
      createdAt: user.createdAt,
      registrationIp: user.registrationIp || '',
      registrationDevice: user.registrationDevice || '',
      registrationReferrer: user.registrationReferrer || '',
      lastLoginIp: user.lastLoginIp || '',
      lastLoginDevice: user.lastLoginDevice || '',
      sessions: (user.sessions || []).map(s => ({
        sessionId: s.sessionId,
        device: s.device,
        ip: s.ip,
        createdAt: s.createdAt,
      })),
      devices: deviceHistory,
      ipHistory: uniqueIps,
      suspiciousLogin,
      orderCount,
      totalSpent,
      downloadCount,
    },
  })
})
