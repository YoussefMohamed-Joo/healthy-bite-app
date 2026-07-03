import { Router } from 'express'
import * as dashCtrl from '../controllers/dashboardController.js'
import { adminRequired } from '../middleware/auth.js'

const router = Router()

router.get('/analytics', adminRequired, dashCtrl.getAnalytics)
router.get('/revenue-chart', adminRequired, dashCtrl.getRevenueChart)

export default router
