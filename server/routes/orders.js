import { Router } from 'express'
import * as orderCtrl from '../controllers/orderController.js'
import { authRequired, optionalAuth, adminRequired } from '../middleware/auth.js'
import { uploadReceipt } from '../middleware/upload.js'
import { strictLimiter } from '../middleware/ratelimit.js'
import honeypot from '../middleware/honeypot.js'
import { createPaymentIntent } from '../services/paymentService.js'
import ApiError from '../utils/ApiError.js'

const router = Router()

router.get('/', authRequired, orderCtrl.list)
router.get('/payment-pending', adminRequired, orderCtrl.listPaymentPending)
router.post('/', honeypot, optionalAuth, uploadReceipt, orderCtrl.createOrderValidation, orderCtrl.create)
router.post('/create-payment-intent', strictLimiter, authRequired, async (req, res) => {
  const { amount } = req.body
  if (!amount || amount <= 0) throw new ApiError(400, 'Invalid amount')
  const pi = await createPaymentIntent(amount, 'egp')
  res.json({ clientSecret: pi.clientSecret })
})
router.put('/:id/status', authRequired, orderCtrl.updateStatus)
router.post('/:id/verify', adminRequired, orderCtrl.verifyPayment)
router.post('/:id/reject-payment', adminRequired, orderCtrl.rejectPayment)

export default router
