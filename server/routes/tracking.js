import { Router } from 'express'
import PageVisit from '../models/PageVisit.js'
import Download from '../models/Download.js'
import { optionalAuth } from '../middleware/auth.js'
import catchAsync from '../utils/catchAsync.js'

const router = Router()

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

router.post('/visit', optionalAuth, catchAsync(async (req, res) => {
  const { page, referrer } = req.body
  const ip = getClientIp(req)
  const userAgent = req.headers['user-agent'] || ''
  const deviceType = detectDevice(userAgent)

  await PageVisit.create({
    user: req.userId || null,
    page: page || '/',
    ip,
    userAgent,
    referrer: referrer || req.headers['referer'] || '',
    deviceType,
    sessionId: req.cookies?.sessionId || '',
  })

  res.json({ status: 'success' })
}))

router.post('/download', optionalAuth, catchAsync(async (req, res) => {
  const { device } = req.body
  const ip = getClientIp(req)
  const userAgent = req.headers['user-agent'] || ''

  await Download.create({
    user: req.userId || null,
    device: device === 'ios' ? 'ios' : 'android',
    ip,
    userAgent,
    referrer: req.headers['referer'] || '',
  })

  res.json({ status: 'success' })
}))

export default router
