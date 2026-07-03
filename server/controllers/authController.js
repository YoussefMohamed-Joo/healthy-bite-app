import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { body } from 'express-validator'
import validate from '../middleware/validate.js'
import * as authService from '../services/authService.js'
import catchAsync from '../utils/catchAsync.js'
import ApiError from '../utils/ApiError.js'
import config from '../config/index.js'
import User from '../models/User.js'
import { TOKEN_COOKIE_OPTIONS } from '../middleware/auth.js'
import { sendBrevo } from '../services/emailService.js'

function getVerifyOptions() {
  if (config.jwtPublicKey) return { publicKey: config.jwtPublicKey, algorithms: ['RS256'] }
  return { secret: config.jwtSecret }
}

function setTokenCookie(res, token, rememberMe = false) {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie('token', token, TOKEN_COOKIE_OPTIONS(rememberMe))
  res.cookie('rememberMe', rememberMe ? 'true' : 'false', {
    httpOnly: false,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000,
  })
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
  setTokenCookie(res, result.token, req.body.rememberMe)
  res.status(201).json({ status: 'success', user: result.user, token: result.token })
})

export const login = catchAsync(async (req, res) => {
  const { email, password, rememberMe } = req.body
  const result = await authService.loginUser({ email, password, rememberMe, req })
  setTokenCookie(res, result.token, rememberMe)
  res.json({ status: 'success', user: result.user, token: result.token })
})

export const getMe = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.userId)
  const token = req.cookies?.token || ''
  res.json({ status: 'success', user, token })
})

export const updateProfile = catchAsync(async (req, res) => {
  const user = await authService.updateProfile(req.userId, req.body)
  res.json({ status: 'success', user })
})

export const refreshToken = catchAsync(async (req, res) => {
  const newToken = generateToken(req.userId, req.sessionId, req.cookies?.rememberMe === 'true')
  setTokenCookie(res, newToken, req.cookies?.rememberMe === 'true')
  res.json({ status: 'success', token: newToken })
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

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body
  if (!email) return next(new ApiError('الإيميل مطلوب', 400))

  const user = await User.findOne({ email: email.toLowerCase() })
  if (!user) {
    return res.json({ message: 'لو الإيميل ده مسجل عندنا، هتوصلك رسالة فيها رابط استعادة كلمة المرور.' })
  }

  const resetToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  user.resetPasswordToken = hashedToken
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000
  await user.save()

  const clientUrl = config.clientUrl || 'https://helthybite.vercel.app'
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`

  try {
    await sendBrevo({
      to: email,
      subject: '🔐 استعادة كلمة المرور - Helthy Bite',
      html: `
        <div style="font-family: 'Cairo', sans-serif; text-align: center; padding: 40px 20px; background: #f8f9f8;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; border: 1px solid #e5e7eb;">
            <h1 style="color: #237C3C; font-size: 24px; margin-bottom: 12px;">استعادة كلمة المرور</h1>
            <p style="color: #666; font-size: 14px; line-height: 1.7; margin-bottom: 24px;">
              ضغط على الرابط عشان تدخل كلمة سر جديدة. الرابط صالح لمدة ساعة.
            </p>
            <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #237C3C; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 15px;">
              استعادة كلمة المرور
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">
              لو أنت ما طلبتش استعادة كلمة المرور، تجاهل الرسالة.
            </p>
          </div>
        </div>
      `,
    })
  } catch {
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()
    return next(new ApiError('فشل إرسال الإيميل. حاول تاني.', 500))
  }

  res.json({ message: 'لو الإيميل ده مسجل عندنا، هتوصلك رسالة فيها رابط استعادة كلمة المرور.' })
})

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token, password } = req.body
  if (!token || !password) return next(new ApiError('البيانات ناقصة', 400))
  if (password.length < 6) return next(new ApiError('كلمة المرور لا تقل عن 6 أحرف', 400))

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  })

  if (!user) return next(new ApiError('الرابط غير صالح أو منتهي', 400))

  user.password = password
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined
  await user.save()

  res.json({ message: 'تم تغيير كلمة المرور بنجاح.' })
})
