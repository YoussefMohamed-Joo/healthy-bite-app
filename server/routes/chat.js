import { Router } from 'express'
import { authRequired, adminRequired } from '../middleware/auth.js'
import catchAsync from '../utils/catchAsync.js'
import ApiError from '../utils/ApiError.js'
import { Conversation, Message } from '../models/Chat.js'
import prisma from '../services/prisma.js'
import { logActivity } from '../services/activityService.js'

const router = Router()

// Admin: list all conversations
router.get('/', adminRequired, catchAsync(async (req, res) => {
  const { status } = req.query

  if (prisma) {
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
      id: c.id, userId: c.userId, userName: c.userName, userEmail: c.userEmail,
      status: c.status, updatedAt: c.updatedAt, createdAt: c.createdAt,
      lastMessage: c.messages[0] || null,
    }))
    return res.json({ data })
  }

  const filter = status ? { status } : {}
  const conversations = await Conversation.find(filter).sort({ updatedAt: -1 }).lean()
  const data = await Promise.all(conversations.map(async c => {
    const lastMsg = await Message.findOne({ conversationId: c._id.toString() })
      .sort({ createdAt: -1 })
      .select('content createdAt senderRole')
      .lean()
    return {
      id: c._id.toString(), userId: c.userId, userName: c.userName, userEmail: c.userEmail,
      status: c.status, updatedAt: c.updatedAt, createdAt: c.createdAt,
      lastMessage: lastMsg || null,
    }
  }))
  res.json({ data })
}))

// User: get my active conversation or create one
router.get('/my', authRequired, catchAsync(async (req, res) => {
  const userId = String(req.user._id)

  if (prisma) {
    let conv = await prisma.conversation.findFirst({
      where: { userId, status: 'active' },
      orderBy: { updatedAt: 'desc' },
    })
    if (!conv) {
      conv = await prisma.conversation.create({
        data: { userId, userName: req.user.name || '', userEmail: req.user.email || '' },
      })
    }
    return res.json({ data: conv })
  }

  let conv = await Conversation.findOne({ userId, status: 'active' }).sort({ updatedAt: -1 })
  if (!conv) {
    conv = await Conversation.create({
      userId, userName: req.user.name || '', userEmail: req.user.email || '',
    })
  }
  res.json({ data: { id: conv._id.toString(), userId: conv.userId, userName: conv.userName, userEmail: conv.userEmail, status: conv.status, createdAt: conv.createdAt, updatedAt: conv.updatedAt } })
}))

// Get messages for a conversation
router.get('/:id/messages', catchAsync(async (req, res) => {
  if (prisma) {
    const messages = await prisma.message.findMany({
      where: { conversationId: req.params.id },
      orderBy: { createdAt: 'asc' },
    })
    return res.json({ data: messages || [] })
  }

  const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 }).lean()
  res.json({ data: messages.map(m => ({ id: m._id.toString(), ...m, _id: undefined })) || [] })
}))

// Send a message
router.post('/:id/message', authRequired, catchAsync(async (req, res) => {
  const { content } = req.body
  if (!content?.trim()) throw new ApiError(400, 'Message is required')

  const senderRole = req.user.role === 'admin' ? 'admin' : 'user'

  if (prisma) {
    const [message] = await Promise.all([
      prisma.message.create({
        data: { conversationId: req.params.id, senderId: String(req.user._id), senderRole, content: content.trim() },
      }),
      prisma.conversation.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } }),
    ])
    await logActivity(req.user._id, 'chat_message', `رسالة جديدة في المحادثة ${req.params.id}`)
    return res.json({ data: message })
  }

  const message = await Message.create({
    conversationId: req.params.id, senderId: String(req.user._id), senderRole, content: content.trim(),
  })
  await Conversation.updateOne({ _id: req.params.id }, { updatedAt: new Date() })
  await logActivity(req.user._id, 'chat_message', `رسالة جديدة في المحادثة ${req.params.id}`)
  res.json({ data: { id: message._id.toString(), conversationId: message.conversationId, senderId: message.senderId, senderRole: message.senderRole, content: message.content, createdAt: message.createdAt } })
}))

// Admin: resolve
router.patch('/:id/resolve', adminRequired, catchAsync(async (req, res) => {
  if (prisma) {
    const data = await prisma.conversation.update({ where: { id: req.params.id }, data: { status: 'resolved', updatedAt: new Date() } })
    return res.json({ data })
  }
  const data = await Conversation.findByIdAndUpdate(req.params.id, { status: 'resolved', updatedAt: new Date() }, { new: true })
  res.json({ data })
}))

// Admin: reopen
router.patch('/:id/reopen', adminRequired, catchAsync(async (req, res) => {
  if (prisma) {
    const data = await prisma.conversation.update({ where: { id: req.params.id }, data: { status: 'active', updatedAt: new Date() } })
    return res.json({ data })
  }
  const data = await Conversation.findByIdAndUpdate(req.params.id, { status: 'active', updatedAt: new Date() }, { new: true })
  res.json({ data })
}))

export default router
