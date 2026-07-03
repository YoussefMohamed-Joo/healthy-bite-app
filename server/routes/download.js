import { Router } from 'express'
import Download from '../models/Download.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

const APK_URL = 'https://github.com/YoussefMohamed-Joo/healthy-bite-app/releases/latest/download/HealthyBite-Android.apk'

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || ''
}

function detectDevice(ua) {
  if (!ua) return 'unknown'
  const u = ua.toLowerCase()
  if (/android/.test(u)) return 'android'
  if (/iphone|ipad|ipod/.test(u)) return 'ios'
  return 'desktop'
}

router.get('/android', optionalAuth, async (req, res) => {
  const ip = getClientIp(req)
  const userAgent = req.headers['user-agent'] || ''
  const device = detectDevice(userAgent)

  try {
    await Download.create({
      user: req.userId || null,
      device: device === 'ios' ? 'ios' : 'android',
      ip,
      userAgent,
      referrer: req.headers['referer'] || '',
    })
  } catch { /* silent */ }

  res.redirect(302, APK_URL)
})

export default router
