import prisma from '../services/prisma.js'
import catchAsync from '../utils/catchAsync.js'

export const getMyNotifications = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 20
  const skip = (page - 1) * limit

  const [notifications, total, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId: req.userId } }),
    prisma.notification.count({ where: { userId: req.userId, read: false } }),
  ])

  res.json({
    status: 'success',
    data: notifications,
    unread,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
})

export const markAsRead = catchAsync(async (req, res) => {
  const { id } = req.params
  await prisma.notification.updateMany({
    where: { id, userId: req.userId },
    data: { read: true },
  })
  res.json({ status: 'success' })
})

export const markAllAsRead = catchAsync(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.userId, read: false },
    data: { read: true },
  })
  res.json({ status: 'success' })
})

export const createNotification = async (userId, type, title, body, data = null) => {
  try {
    await prisma.notification.create({
      data: { userId, type, title, body, data: data ? JSON.stringify(data) : null },
    })
  } catch { /* silent */ }
}
