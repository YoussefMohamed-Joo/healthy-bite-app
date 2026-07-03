import { Router } from 'express'
import Waitlist from '../models/Waitlist.js'
import ApiError from '../utils/ApiError.js'

const router = Router()

router.get('/build-status', async (req, res) => {
  try {
    const response = await fetch('https://api.github.com/repos/YoussefMohamed-Joo/healthy-bite-app/releases/latest')
    if (!response.ok) return res.json({ status: 'success', android: false, ios: false })
    const data = await response.json()
    const hasApk = data.assets?.some(a => a.name === 'HealthyBite-Android.apk')
    res.json({ status: 'success', android: !!hasApk, ios: false })
  } catch {
    res.json({ status: 'success', android: false, ios: false })
  }
})

router.get('/version', async (_req, res) => {
  try {
    const response = await fetch('https://api.github.com/repos/YoussefMohamed-Joo/healthy-bite-app/releases/latest')
    if (!response.ok) return res.json({ status: 'success', data: { version: '1.0.0', apkUrl: '', releaseNotes: '', forceUpdate: false } })
    const data = await response.json()
    const version = data.tag_name?.replace('v', '') || '1.0.0'
    const major = parseInt(version.split('.')[0]) || parseInt(version)
    res.json({
      status: 'success',
      data: {
        version,
        apkUrl: `${req.protocol}://${req.get('host')}/api/download/android`,
        releaseNotes: data.body || '',
        forceUpdate: major >= 10,
      },
    })
  } catch {
    res.json({ status: 'success', data: { version: '1.0.0', apkUrl: '', releaseNotes: '', forceUpdate: false } })
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
