import { Router } from 'express'
import { authRequired, adminRequired } from '../middleware/auth.js'
import catchAsync from '../utils/catchAsync.js'
import ApiError from '../utils/ApiError.js'
import prisma from '../services/prisma.js'
import { logActivity } from '../services/activityService.js'

const router = Router()

// Admin: list all conversations
router.get('/', adminRequired, catchAsync(async (req, res) => {
  const { status } = req.query
  const where = status ? { status } : {}

  const conversations = await prisma.conversation.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, createdAt: true, senderRole: true },
      },
    },
  })

  const data = conversations.map(c => ({
    id: c.id,
    userId: c.userId,
    userName: c.userName,
    userEmail: c.userEmail,
    status: c.status,
    updatedAt: c.updatedAt,
    createdAt: c.createdAt,
    lastMessage: c.messages[0] || null,
  }))

  res.json({ data })
}))

// User: get my active conversation or create one
router.get('/my', authRequired, catchAsync(async (req, res) => {
  const userId = String(req.user._id)

  let conv = await prisma.conversation.findFirst({
    where: { userId, status: 'active' },
    orderBy: { updatedAt: 'desc' },
  })

  if (!conv) {
    conv = await prisma.conversation.create({
      data: {
        userId,
        userName: req.user.name || '',
        userEmail: req.user.email || '',
      },
    })
  }

  res.json({ data: conv })
}))

// Get messages for a conversation
router.get('/:id/messages', catchAsync(async (req, res) => {
  const messages = await prisma.message.findMany({
    where: { conversationId: req.params.id },
    orderBy: { createdAt: 'asc' },
  })

  res.json({ data: messages || [] })
}))

// Send a message
router.post('/:id/message', authRequired, catchAsync(async (req, res) => {
  const { content } = req.body
  if (!content?.trim()) return res.status(400).json({ message: 'Message is required' })

  const senderRole = req.user.role === 'admin' ? 'admin' : 'user'

  const [message] = await Promise.all([
    prisma.message.create({
      data: {
        conversationId: req.params.id,
        senderId: String(req.user._id),
        senderRole,
        content: content.trim(),
      },
    }),
    prisma.conversation.update({
      where: { id: req.params.id },
      data: { updatedAt: new Date() },
    }),
  ])

  await logActivity(req.user._id, 'chat_message', `رسالة جديدة في المحادثة ${req.params.id}`)

  res.json({ data: message })
}))

// Admin: resolve
router.patch('/:id/resolve', adminRequired, catchAsync(async (req, res) => {
  const data = await prisma.conversation.update({
    where: { id: req.params.id },
    data: { status: 'resolved', updatedAt: new Date() },
  })
  res.json({ data })
}))

// Admin: reopen
router.patch('/:id/reopen', adminRequired, catchAsync(async (req, res) => {
  const data = await prisma.conversation.update({
    where: { id: req.params.id },
    data: { status: 'active', updatedAt: new Date() },
  })
  res.json({ data })
}))

export default router
