import { Router } from 'express'
import Waitlist from '../models/Waitlist.js'
import ApiError from '../utils/ApiError.js'

const router = Router()

router.get('/build-status', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  try {
    const response = await fetch('https://api.github.com/repos/YoussefMohamed-Joo/healthy-bite-app/releases/latest', {
      headers: { 'Accept': 'application/vnd.github+json' },
    })
    if (!response.ok) return res.json({ status: 'success', android: false, ios: false })
    const data = await response.json()
    const hasApk = data.assets?.some(a => a.name === 'HealthyBite-Android.apk')
    res.json({ status: 'success', android: !!hasApk, ios: false })
  } catch {
    res.json({ status: 'success', android: false, ios: false })
  }
})

router.get('/version', async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  try {
    const response = await fetch('https://api.github.com/repos/YoussefMohamed-Joo/healthy-bite-app/releases/latest', {
      headers: { 'Accept': 'application/vnd.github+json', 'User-Agent': 'HealthyBite-Server/1.0' },
    })
    if (!response.ok) {
      return res.json({ status: 'success', data: { version: '1.0.0', apkUrl: '', releaseNotes: '', forceUpdate: false } })
    }
    const data = await response.json()
    const version = String(data.tag_name || '1.0.0').replace('v', '')
    const major = parseInt(version, 10) || 0
    const host = req.get('host') || 'healthybite-server.vercel.app'
    res.json({
      status: 'success',
      data: {
        version,
        apkUrl: `https://${host}/api/download/android`,
        releaseNotes: data.body || '',
        forceUpdate: major >= 10,
      },
    })
  } catch (err) {
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
