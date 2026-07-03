import { Router } from 'express'
import * as couponCtrl from '../controllers/couponController.js'
import { adminRequired, authRequired } from '../middleware/auth.js'

const router = Router()

router.get('/', adminRequired, couponCtrl.list)
router.post('/', adminRequired, couponCtrl.create)
router.put('/:id', adminRequired, couponCtrl.update)
router.delete('/:id', adminRequired, couponCtrl.remove)
router.post('/validate', authRequired, couponCtrl.validate)

export default router
