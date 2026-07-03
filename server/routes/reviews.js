import { Router } from 'express'
import * as reviewCtrl from '../controllers/reviewController.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

router.get('/product/:productId', reviewCtrl.getProductReviews)
router.post('/', authRequired, reviewCtrl.createReview)
router.put('/:id', authRequired, reviewCtrl.updateReview)
router.delete('/:id', authRequired, reviewCtrl.deleteReview)

export default router
