import { Router } from 'express'
import Chat from '../models/Chat.js'
import Message from '../models/Message.js'
import { authRequired, adminRequired } from '../middleware/auth.js'
import catchAsync from '../utils/catchAsync.js'
import ApiError from '../utils/ApiError.js'

const router = Router()

// Admin: get all chats
router.get('/', adminRequired, catchAsync(async (req, res) => {
  const { status } = req.query
  const filter = status ? { status } : {}
  const chats = await Chat.find(filter)
    .populate('user', 'name email phone')
    .sort({ lastMessageAt: -1 })
  res.json({ data: chats })
}))

// User: get my active chat or create one
router.get('/my', authRequired, catchAsync(async (req, res) => {
  let chat = await Chat.findOne({ user: req.user._id, status: 'active' })
    .populate('user', 'name email phone')
  if (!chat) {
    chat = await Chat.create({ user: req.user._id })
    chat = await Chat.findById(chat._id).populate('user', 'name email phone')
  }
  chat.unreadUser = 0
  await chat.save()
  res.json({ data: chat })
}))

// Get messages for a chat
router.get('/:id/messages', catchAsync(async (req, res) => {
  const messages = await Message.find({ chat: req.params.id }).sort({ createdAt: 1 })
  res.json({ data: messages })
}))

// Send a message
router.post('/:id/message', authRequired, catchAsync(async (req, res) => {
  const { text, type, image } = req.body
  const chat = await Chat.findById(req.params.id)
  if (!chat) throw new ApiError(404, 'Chat not found')

  const sender = req.user.role === 'admin' ? 'admin' : 'user'

  const message = await Message.create({
    chat: chat._id,
    sender,
    text: text || '',
    type: type || 'text',
    image: image || null,
  })

  chat.lastMessage = text || (type === 'image' ? '🖼 صورة' : '')
  chat.lastMessageAt = new Date()
  if (sender === 'admin') chat.unreadUser += 1
  else chat.unreadAdmin += 1
  await chat.save()

  const io = req.app.get('io')
  if (io) {
    io.to(`chat:${chat._id}`).emit('chat:message', {
      ...message.toObject(),
      chat: chat._id,
    })
  }

  res.json({ data: message })
}))

// Mark messages as read
router.patch('/:id/read', authRequired, catchAsync(async (req, res) => {
  const chat = await Chat.findById(req.params.id)
  if (!chat) throw new ApiError(404, 'Chat not found')

  if (req.user.role === 'admin') chat.unreadAdmin = 0
  else chat.unreadUser = 0
  await chat.save()

  await Message.updateMany({ chat: chat._id, read: false }, { read: true })
  res.json({ success: true })
}))

// Admin: resolve a chat
router.patch('/:id/resolve', adminRequired, catchAsync(async (req, res) => {
  const chat = await Chat.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true })
  res.json({ data: chat })
}))

// Admin: reopen a chat
router.patch('/:id/reopen', adminRequired, catchAsync(async (req, res) => {
  const chat = await Chat.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true })
  res.json({ data: chat })
}))

export default router
