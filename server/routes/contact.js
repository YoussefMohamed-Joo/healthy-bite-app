import { Router } from 'express'
import { sendBrevo } from '../services/emailService.js'
import { strictLimiter } from '../middleware/ratelimit.js'
import ApiError from '../utils/ApiError.js'

const router = Router()

router.post('/send', strictLimiter, async (req, res) => {
  const { name, email, message } = req.body
  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    throw new ApiError(400, 'All fields are required')
  }

  const html = `
    <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #f9fafb; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2E7D32; font-size: 24px; margin: 0;">📬 رسالة جديدة من الموقع</h1>
      </div>
      <div style="background: white; padding: 24px; border-radius: 12px;">
        <p style="color: #666; font-size: 14px;"><strong>الاسم:</strong> ${name}</p>
        <p style="color: #666; font-size: 14px;"><strong>البريد الإلكتروني:</strong> ${email}</p>
        <div style="border-top: 1px solid #e5e7eb; margin: 16px 0;"></div>
        <p style="color: #333; font-size: 14px; line-height: 1.7;">${message}</p>
      </div>
    </div>`

  await sendBrevo({
    to: 'bookbeacon.books@gmail.com',
    subject: `رسالة جديدة من ${name} - Helthy Bite`,
    html,
  })

  res.json({ status: 'success', message: 'تم إرسال رسالتك بنجاح' })
})

export default router
