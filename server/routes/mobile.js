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
    if (!response.ok) return res.json({ status: 'success', data: { version: '1.0.0', apkUrl: '', releaseNotes: '' } })
    const data = await response.json()
    res.json({
      status: 'success',
      data: {
        version: data.tag_name?.replace('v', '') || '1.0.0',
        apkUrl: `https://github.com/YoussefMohamed-Joo/healthy-bite-app/releases/download/${data.tag_name}/HealthyBite-Android.apk`,
        releaseNotes: data.body || '',
      },
    })
  } catch {
    res.json({ status: 'success', data: { version: '1.0.0', apkUrl: '', releaseNotes: '' } })
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
