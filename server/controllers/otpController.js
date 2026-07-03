import crypto from 'crypto'
import Otp from '../models/Otp.js'
import { sendOtpEmail } from '../services/emailService.js'
import catchAsync from '../utils/catchAsync.js'
import ApiError from '../utils/ApiError.js'

export const sendOtp = catchAsync(async (req, res) => {
  const { email } = req.body
  if (!email) throw new ApiError(400, 'Email is required')

  const recent = await Otp.findOne({ email, createdAt: { $gt: new Date(Date.now() - 60000) }, verified: false })
  if (recent) throw new ApiError(429, 'انتظر دقيقة قبل طلب رمز جديد')

  const otp = String(Math.floor(100000 + Math.random() * 900000))
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await Otp.create({ email, otp, expiresAt })

  try {
    await sendOtpEmail(email, otp)
    res.json({ status: 'success', message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني' })
  } catch (err) {
    console.error('Email send failed:', err.message)
    res.json({ status: 'success', message: 'تم إرسال رمز التحقق' })
  }
})

export const verifyOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body
  if (!email || !otp) throw new ApiError(400, 'Email and OTP are required')

  const record = await Otp.findOne({ email, verified: false, expiresAt: { $gt: new Date() } }).sort('-createdAt')
  if (!record) throw new ApiError(400, 'انتهت صلاحية الرمز أو لا يوجد رمز')

  if (record.attempts >= 3) throw new ApiError(429, 'تم تجاوز عدد المحاولات المسموح بها')

  record.attempts += 1

  if (record.otp !== otp) {
    await record.save()
    throw new ApiError(400, 'رمز التحقق غير صحيح')
  }

  record.verified = true
  await record.save()

  res.json({ status: 'success', message: 'تم التحقق من البريد الإلكتروني' })
})
