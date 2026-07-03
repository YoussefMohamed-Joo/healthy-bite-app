import { Router } from 'express'
import { authRequired, adminRequired } from '../middleware/auth.js'
import catchAsync from '../utils/catchAsync.js'
import { supabase } from '../utils/supabase.js'
import { logActivity } from '../services/activityService.js'

const router = Router()

// Admin: list all conversations
router.get('/', adminRequired, catchAsync(async (req, res) => {
  const { status } = req.query
  let query = supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return res.status(500).json({ message: error.message })

  // Attach last message per conversation
  const conversations = await Promise.all((data || []).map(async (conv) => {
    const { data: msgs } = await supabase
      .from('messages')
      .select('content, created_at, sender_role')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: false })
      .limit(1)
    return { ...conv, lastMessage: msgs?.[0] || null }
  }))

  res.json({ data: conversations })
}))

// User: get my active conversation or create one
router.get('/my', authRequired, catchAsync(async (req, res) => {
  const userId = String(req.user._id)

  let { data: conv } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (!conv) {
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        user_name: req.user.name || '',
        user_email: req.user.email || '',
      })
      .select()
      .single()

    if (error) return res.status(500).json({ message: error.message })
    conv = newConv
  }

  res.json({ data: conv })
}))

// Get messages for a conversation
router.get('/:id/messages', catchAsync(async (req, res) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', req.params.id)
    .order('created_at', { ascending: true })

  if (error) return res.status(500).json({ message: error.message })
  res.json({ data: data || [] })
}))

// Send a message
router.post('/:id/message', authRequired, catchAsync(async (req, res) => {
  const { content } = req.body
  if (!content?.trim()) return res.status(400).json({ message: 'Message is required' })

  const senderRole = req.user.role === 'admin' ? 'admin' : 'user'

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: req.params.id,
      sender_id: String(req.user._id),
      sender_role: senderRole,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) return res.status(500).json({ message: error.message })

  // Touch updated_at on conversation
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', req.params.id)

  await logActivity(req.user._id, 'chat_message', `رسالة جديدة في المحادثة ${req.params.id}`)

  res.json({ data })
}))

// Admin: resolve
router.patch('/:id/resolve', adminRequired, catchAsync(async (req, res) => {
  const { data, error } = await supabase
    .from('conversations')
    .update({ status: 'resolved', updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(500).json({ message: error.message })
  res.json({ data })
}))

// Admin: reopen
router.patch('/:id/reopen', adminRequired, catchAsync(async (req, res) => {
  const { data, error } = await supabase
    .from('conversations')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single()

  if (error) return res.status(500).json({ message: error.message })
  res.json({ data })
}))

export default router
