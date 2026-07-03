import jwt from 'jsonwebtoken'
import config from '../config/index.js'
import User from '../models/User.js'
import ApiError from '../utils/ApiError.js'
import catchAsync from '../utils/catchAsync.js'

function getSignOptions() {
  if (config.jwtPrivateKey && config.jwtPublicKey) {
    return { algorithm: 'RS256', privateKey: config.jwtPrivateKey, publicKey: config.jwtPublicKey }
  }
  return { algorithm: 'HS256', secret: config.jwtSecret }
}

export const generateToken = (userId, sessionId, rememberMe = false) => {
  const opts = getSignOptions()
  const expiresIn = rememberMe ? config.jwtLongExpiry : config.jwtExpiresIn

  if (opts.algorithm === 'RS256') {
    return jwt.sign({ userId, sessionId }, opts.privateKey, { algorithm: 'RS256', expiresIn })
  }
  return jwt.sign({ userId, sessionId }, opts.secret, { expiresIn })
}

export const TOKEN_COOKIE_OPTIONS = (rememberMe = false) => ({
  httpOnly: true,
  secure: config.env === 'production',
  sameSite: config.env === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
})

function getIp(req) {
  return req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim()
    || req?.headers?.['x-real-ip']
    || req?.socket?.remoteAddress
    || ''
}

function extractToken(req) {
  if (req.cookies?.token) return req.cookies.token
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) return header.split(' ')[1]
  return null
}

async function authenticate(req) {
  const token = extractToken(req)
  if (!token) throw new ApiError(401, 'No token provided')

  const opts = getSignOptions()
  let decoded
  try {
    decoded = opts.algorithm === 'RS256'
      ? jwt.verify(token, opts.publicKey, { algorithms: ['RS256'] })
      : jwt.verify(token, opts.secret)
  } catch {
    throw new ApiError(401, 'Invalid or expired token')
  }

  const user = await User.findById(decoded.userId)
  if (!user || !user.active) throw new ApiError(401, 'User not found or deactivated')

  if (decoded.sessionId) {
    const sessionMatch = user.sessions?.some(s => s.sessionId === decoded.sessionId)
    if (!sessionMatch) {
      const ip = getIp(req)
      const ipMatch = user.sessions?.some(s => s.ip === ip)
      if (!ipMatch) {
        throw new ApiError(401, 'Session expired, please login again')
      }
    }
  }

  req.user = user
  req.userId = user._id
  req.sessionId = decoded.sessionId
}

export const authRequired = catchAsync(async (req, res, next) => {
  await authenticate(req)
  next()
})

export const adminRequired = catchAsync(async (req, res, next) => {
  await authenticate(req)
  if (req.user.role !== 'admin') throw new ApiError(403, 'Admin access required')
  next()
})

export const optionalAuth = catchAsync(async (req, res, next) => {
  try {
    const token = extractToken(req)
    if (token) {
      const opts = getSignOptions()
      const decoded = opts.algorithm === 'RS256'
        ? jwt.verify(token, opts.publicKey, { algorithms: ['RS256'] })
        : jwt.verify(token, opts.secret)
      const user = await User.findById(decoded.userId)
      if (user && user.active) {
        if (decoded.sessionId) {
          const sessionMatch = user.sessions?.some(s => s.sessionId === decoded.sessionId)
          if (!sessionMatch) {
            const ip = getIp(req)
            const ipMatch = user.sessions?.some(s => s.ip === ip)
            if (!ipMatch) {
              throw new ApiError(401, 'Session expired')
            }
          }
        }
        req.user = user
        req.userId = user._id
      }
    }
  } catch { /* silent */ }
  next()
})
