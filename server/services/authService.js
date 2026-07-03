import crypto from 'crypto'
import User from '../models/User.js'
import { generateToken } from '../middleware/auth.js'
import ApiError from '../utils/ApiError.js'
import { logActivity } from './activityService.js'

const ADMIN_EMAIL = 'admin@healthybite.com'

export async function registerUser({ name, email, password, phone, address }, io) {
  const existing = await User.findOne({ email })
  if (existing) throw new ApiError(400, 'Email already registered')

  const role = email === ADMIN_EMAIL ? 'admin' : 'client'
  const sessionId = crypto.randomUUID()
  const user = await User.create({ name, email, password, phone, address, role })
  if (!user.sessions) user.sessions = []
  user.sessions.push({ sessionId, device: '' })
  await user.save()
  const token = generateToken(user._id, sessionId)

  await logActivity(user._id, 'register', 'تم إنشاء الحساب')

  if (io) {
    io.to('admin-room').emit('new_user_registered', {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    })
  }

  return { token, user }
}

export async function loginUser({ email, password, req }) {
  const user = await User.findOne({ email }).select('+password')
  if (!user) throw new ApiError(400, 'Invalid email or password')

  const match = await user.comparePassword(password)
  if (!match) throw new ApiError(400, 'Invalid email or password')
  if (!user.active) throw new ApiError(403, 'Account deactivated')

  // Auto-promote admin email
  if (email === ADMIN_EMAIL && user.role !== 'admin') {
    user.role = 'admin'
    await user.save()
  }

  const sessionId = crypto.randomUUID()
  const device = req?.headers?.['user-agent'] || ''

  if (!user.sessions) user.sessions = []
  if (user.sessions.length >= 2) {
    user.sessions = []
  }
  user.sessions.push({ sessionId, device })
  await user.save()

  const token = generateToken(user._id, sessionId)

  await logActivity(user._id, 'login', `تم تسجيل الدخول من ${device}`)

  return { token, user: { ...user.toJSON(), password: undefined } }
}

export async function getProfile(userId) {
  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, 'User not found')
  return user
}

export async function updateProfile(userId, data) {
  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, 'User not found')

  if (data.name) user.name = data.name
  if (data.phone !== undefined) user.phone = data.phone
  if (data.address !== undefined) user.address = data.address
  if (data.password) {
    if (data.password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters')
    user.password = data.password
  }
  if (data.currentPassword && data.newPassword) {
    const match = await user.comparePassword(data.currentPassword)
    if (!match) throw new ApiError(400, 'Current password is incorrect')
    if (data.newPassword.length < 6) throw new ApiError(400, 'New password must be at least 6 characters')
    user.password = data.newPassword
  }

  await user.save()
  await logActivity(userId, 'profile_updated', 'تم تحديث البيانات')
  return user
}

export async function logoutUser(userId, sessionId) {
  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, 'User not found')
  user.sessions = user.sessions.filter(s => s.sessionId !== sessionId)
  await user.save()
  return { message: 'Logged out' }
}

export async function deleteAccount(userId, permanent = false) {
  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, 'User not found')
  if (user.role === 'admin') throw new ApiError(403, 'Admin accounts cannot be deleted')

  if (permanent) {
    await Order.updateMany({ user: userId }, { user: null, email: '' })
    await User.findByIdAndDelete(userId)
    await logActivity(userId, 'account_permanently_deleted', 'تم حذف الحساب نهائياً')
    return { message: 'Account permanently deleted' }
  }

  user.active = false
  user.sessions = []
  await user.save()
  await logActivity(userId, 'account_deactivated', 'تم إلغاء تنشيط الحساب')
  return { message: 'Account deactivated. To permanently delete, use ?permanent=true' }
}

export async function exportUserData(userId) {
  const user = await User.findById(userId).lean()
  if (!user) throw new ApiError(404, 'User not found')

  const orders = await Order.find({ user: userId }).sort('-createdAt').lean()

  return {
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    orders: orders.map(o => ({
      id: o._id,
      total: o.total,
      status: o.status,
      items: o.items,
      createdAt: o.createdAt,
    })),
    exportDate: new Date().toISOString(),
  }
}
