import { Router } from 'express'
import * as authCtrl from '../controllers/authController.js'
import { authRequired } from '../middleware/auth.js'
import { authLimiter, otpLimiter } from '../middleware/ratelimit.js'
import honeypot from '../middleware/honeypot.js'

const router = Router()

router.post('/register', otpLimiter, honeypot, authCtrl.registerValidation, authCtrl.register)
router.post('/login', authLimiter, honeypot, authCtrl.loginValidation, authCtrl.login)
router.get('/me', authRequired, authCtrl.getMe)
router.post('/refresh', authRequired, authCtrl.refreshToken)
router.get('/export-data', authRequired, authCtrl.exportData)
router.post('/logout', authRequired, authCtrl.logout)
router.put('/profile', authRequired, authCtrl.updateProfile)
router.delete('/account', authRequired, authCtrl.deleteAccount)
router.post('/forgot-password', authLimiter, authCtrl.forgotPassword)
router.post('/reset-password', authCtrl.resetPassword)

export default router
