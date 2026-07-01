import User from '../models/User.js'
import { generateToken } from '../middleware/auth.js'
import ApiError from '../utils/ApiError.js'

export async function registerUser({ name, email, password, role = 'user' }) {
  const existing = await User.findOne({ email })
  if (existing) throw new ApiError(400, 'Email already registered')

  const user = await User.create({ name, email, password, role })
  const token = generateToken(user._id)
  return { token, user }
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select('+password')
  if (!user) throw new ApiError(400, 'Invalid email or password')

  const match = await user.comparePassword(password)
  if (!match) throw new ApiError(400, 'Invalid email or password')
  if (!user.active) throw new ApiError(403, 'Account deactivated')

  const token = generateToken(user._id)
  return { token, user: { ...user.toJSON(), password: undefined } }
}

export async function getProfile(userId) {
  const user = await User.findById(userId)
  if (!user) throw new ApiError(404, 'User not found')
  return user
}
