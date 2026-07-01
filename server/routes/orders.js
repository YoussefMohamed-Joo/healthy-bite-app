import { Router } from 'express'
import * as orderCtrl from '../controllers/orderController.js'
import { authRequired, optionalAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', authRequired, orderCtrl.list)
router.post('/', optionalAuth, orderCtrl.createOrderValidation, orderCtrl.create)
router.put('/:id/status', authRequired, orderCtrl.updateStatus)

export default router
