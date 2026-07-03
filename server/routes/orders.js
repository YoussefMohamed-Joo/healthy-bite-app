import { Router } from 'express'
import * as orderCtrl from '../controllers/orderController.js'
import { authRequired, optionalAuth, adminRequired } from '../middleware/auth.js'
import { uploadReceipt } from '../middleware/upload.js'
import honeypot from '../middleware/honeypot.js'

const router = Router()

router.get('/', authRequired, orderCtrl.list)
router.get('/payment-pending', adminRequired, orderCtrl.listPaymentPending)
router.post('/', honeypot, optionalAuth, uploadReceipt, orderCtrl.createOrderValidation, orderCtrl.create)
router.put('/:id/status', authRequired, orderCtrl.updateStatus)
router.post('/:id/verify', adminRequired, orderCtrl.verifyPayment)
router.post('/:id/reject-payment', adminRequired, orderCtrl.rejectPayment)

export default router
