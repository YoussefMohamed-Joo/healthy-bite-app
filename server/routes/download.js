import { Router } from 'express'

const router = Router()

const APK_URL = 'https://github.com/YoussefMohamed-Joo/healthy-bite-app/releases/latest/download/HealthyBite-Android.apk'

router.get('/android', (_req, res) => {
  res.redirect(302, APK_URL)
})

export default router
