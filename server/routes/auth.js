import { Router } from 'express'
import * as authCtrl from '../controllers/authController.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

router.post('/register', authCtrl.registerValidation, authCtrl.register)
router.post('/login', authCtrl.loginValidation, authCtrl.login)
router.get('/me', authRequired, authCtrl.getMe)

export default router
