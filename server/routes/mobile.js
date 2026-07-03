import { Router } from 'express'
import Waitlist from '../models/Waitlist.js'
import ApiError from '../utils/ApiError.js'

const router = Router()

router.get('/build-status', async (req, res) => {
  try {
    const response = await fetch(`https://github.com/YoussefMohamed-Joo/healthy-bite-app/releases/latest/download/HealthyBite-Android.apk`, { method: 'HEAD' })
    const ct = response.headers.get('content-type') || ''
    const cl = response.headers.get('content-length') || '0'
    const isApk = ct.includes('vnd.android') || ct.includes('octet-stream') || parseInt(cl) > 10000
    res.json({ status: 'success', android: response.ok && isApk, ios: false })
  } catch {
    res.json({ status: 'success', android: false, ios: false })
  }
})

router.post('/waitlist', async (req, res) => {
  const { email, device } = req.body
  if (!email?.trim()) throw new ApiError(400, 'Email is required')
  const existing = await Waitlist.findOne({ email: email.toLowerCase().trim() })
  if (existing) return res.json({ status: 'success', message: 'أنت مسجل مسبقاً!' })
  await Waitlist.create({ email: email.trim(), device: device || 'android' })
  res.json({ status: 'success', message: 'تم التسجيل! سنخبرك عند توفر التطبيق.' })
})

export default router
