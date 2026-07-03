import rateLimit from 'express-rate-limit'
import config from '../config/index.js'

export const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { status: 'error', message: 'طلبات كتيرة جداً، حاول بعد شوية' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { status: 'error', message: 'محاولات كتيرة، حاول بعد ١٥ دقيقة' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const otpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: { status: 'error', message: 'انتظر دقيقة قبل طلب رمز جديد' },
  standardHeaders: true,
  legacyHeaders: false,
})

export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { status: 'error', message: 'طلبات كتيرة، حاول بعد دقيقة' },
  standardHeaders: true,
  legacyHeaders: false,
})
