import jwt from 'jsonwebtoken'
import { body } from 'express-validator'
import validate from '../middleware/validate.js'
import * as authService from '../services/authService.js'
import catchAsync from '../utils/catchAsync.js'
import config from '../config/index.js'
import { TOKEN_COOKIE_OPTIONS } from '../middleware/auth.js'

function getVerifyOptions() {
  if (config.jwtPublicKey) return { publicKey: config.jwtPublicKey, algorithms: ['RS256'] }
  return { secret: config.jwtSecret }
}

function setTokenCookie(res, token) {
  res.cookie('token', token, TOKEN_COOKIE_OPTIONS)
}

function verifyToken(token) {
  const opts = getVerifyOptions()
  if (opts.publicKey) return jwt.verify(token, opts.publicKey, { algorithms: ['RS256'] })
  return jwt.verify(token, opts.secret)
}

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone is required').trim(),
  body('address').notEmpty().withMessage('Address is required').trim(),
  validate,
]

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
]

export const register = catchAsync(async (req, res) => {
  const io = req.app.get('io')
  const result = await authService.registerUser({ ...req.body, req }, io)
  setTokenCookie(res, result.token)
  res.status(201).json({ status: 'success', user: result.user })
})

export const login = catchAsync(async (req, res) => {
  const result = await authService.loginUser({ ...req.body, req })
  setTokenCookie(res, result.token)
  res.json({ status: 'success', user: result.user })
})

export const getMe = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.userId)
  res.json({ status: 'success', user })
})

export const updateProfile = catchAsync(async (req, res) => {
  const user = await authService.updateProfile(req.userId, req.body)
  res.json({ status: 'success', user })
})

export const logout = catchAsync(async (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1]
  let sessionId = null
  if (token) {
    try {
      const decoded = verifyToken(token)
      sessionId = decoded.sessionId
    } catch { /* token invalid, still clear cookie */ }
  }
  if (sessionId && req.userId) {
    await authService.logoutUser(req.userId, sessionId)
  }
  res.clearCookie('token', { path: '/' })
  res.json({ status: 'success', message: 'Logged out' })
})

export const deleteAccount = catchAsync(async (req, res) => {
  const result = await authService.deleteAccount(req.userId)
  res.clearCookie('token', { path: '/' })
  res.json({ status: 'success', ...result })
})

export const exportData = catchAsync(async (req, res) => {
  const data = await authService.exportUserData(req.userId)
  res.json({ status: 'success', data })
})
