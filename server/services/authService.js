import crypto from 'crypto'
import User from '../models/User.js'
import { generateToken } from '../middleware/auth.js'
import ApiError from '../utils/ApiError.js'
import { logActivity } from './activityService.js'

const ADMIN_EMAIL = 'admin@healthybite.com'

export async function registerUser({ name, email, password, phone, address, req }, io) {
  const existing = await User.findOne({ email })
  if (existing) throw new ApiError(400, 'Email already registered')

  const ip = req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
    || req?.headers?.['x-real-ip']
    || req?.socket?.remoteAddress
    || ''
  const userAgent = req?.headers?.['user-agent'] || ''
  const referrer = req?.headers?.['referer'] || ''

  const role = email === ADMIN_EMAIL ? 'admin' : 'client'
  const sessionId = crypto.randomUUID()

  const deviceType = /android/i.test(userAgent) ? 'android' : /iphone|ipad|ipod/i.test(userAgent) ? 'ios' : 'desktop'

  const user = await User.create({
    name, email, password, phone, address, role,
    registrationIp: ip,
    registrationDevice: deviceType,
    registrationReferrer: referrer,
    devices: [deviceType].filter(Boolean),
  })
  if (!user.sessions) user.sessions = []
  user.sessions.push({ sessionId, device: userAgent, ip })
  await user.save()
  const token = generateToken(user._id, sessionId)

  await logActivity(user._id, 'register', `تم إنشاء الحساب من ${deviceType} [${ip}]`)

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
  if (!user || !user.active || user.email?.startsWith('deleted_')) {
    throw new ApiError(400, 'Invalid email or password')
  }

  const match = await user.comparePassword(password)
  if (!match) throw new ApiError(400, 'Invalid email or password')

  const ip = req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
    || req?.headers?.['x-real-ip']
    || req?.socket?.remoteAddress
    || ''
  const userAgent = req?.headers?.['user-agent'] || ''
  const deviceType = /android/i.test(userAgent) ? 'android' : /iphone|ipad|ipod/i.test(userAgent) ? 'ios' : 'desktop'

  if (email === ADMIN_EMAIL && user.role !== 'admin') {
    user.role = 'admin'
    await user.save()
  }

  const sessionId = crypto.randomUUID()

  if (!user.sessions) user.sessions = []
  if (user.sessions.length >= 2) {
    user.sessions = []
  }
  user.sessions.push({ sessionId, device: userAgent, ip })
  user.lastLoginIp = ip
  user.lastLoginDevice = deviceType
  if (!user.devices) user.devices = []
  if (!user.devices.includes(deviceType)) user.devices.push(deviceType)
  await user.save()

  const token = generateToken(user._id, sessionId)

  await logActivity(user._id, 'login', `تم تسجيل الدخول من ${deviceType} [${ip}]`)

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

export async function deleteAccount(userId) {
  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, 'User not found')
  if (user.role === 'admin') throw new ApiError(403, 'Admin accounts cannot be deleted')

  const timestamp = Date.now()
  user.email = `deleted_${timestamp}_${user.email}`
  user.active = false
  user.sessions = []
  await user.save()

  await logActivity(userId, 'account_deleted', `تم حذف الحساب — البريد الأصلي: ${user.email.replace(`deleted_${timestamp}_`, '')}`)
  return { message: 'Account deleted' }
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
