import jwt from 'jsonwebtoken'
import config from '../config/index.js'
import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import catchAsync from '../utils/catchAsync.js'

export const generateToken = (userId) => jwt.sign({ userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn })

export const authRequired = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) throw new ApiError(401, 'No token provided')

  let decoded
  try { decoded = jwt.verify(header.split(' ')[1], config.jwtSecret) }
  catch { throw new ApiError(401, 'Invalid or expired token') }

  const user = await User.findById(decoded.userId)
  if (!user || !user.active) throw new ApiError(401, 'User not found or deactivated')

  req.user = user
  req.userId = user._id
  next()
})

export const adminRequired = catchAsync(async (req, res, next) => {
  await authRequired(req, res, () => {
    if (req.user.role !== 'admin') throw new ApiError(403, 'Admin access required')
    next()
  })
})

export const optionalAuth = catchAsync(async (req, res, next) => {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.split(' ')[1], config.jwtSecret)
      const user = await User.findById(decoded.userId)
      if (user && user.active) {
        req.user = user
        req.userId = user._id
      }
    } catch { /* silent */ }
  }
  next()
})
