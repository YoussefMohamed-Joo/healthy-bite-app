import { Router } from 'express'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = Router()

router.get('/android', (req, res) => {
  const apkPath = path.resolve(__dirname, '../../client/public/downloads/HealthyBite-Android.apk')
  if (!fs.existsSync(apkPath)) {
    return res.status(404).json({ status: 'error', message: 'التحديث قيد التجهيز' })
  }
  res.download(apkPath, 'HealthyBite-Android.apk')
})

export default router
