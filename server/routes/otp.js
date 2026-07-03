import { Router } from 'express'
import { otpLimiter } from '../middleware/ratelimit.js'
import * as otpCtrl from '../controllers/otpController.js'
const router = Router()
router.post('/send', otpLimiter, otpCtrl.sendOtp)
router.post('/verify', otpLimiter, otpCtrl.verifyOtp)
export default router
