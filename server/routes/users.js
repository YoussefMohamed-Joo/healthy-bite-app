import { Router } from 'express'
import * as userCtrl from '../controllers/userController.js'
import * as activityCtrl from '../controllers/activityController.js'
import { adminRequired } from '../middleware/auth.js'

const router = Router()

router.get('/customers', adminRequired, userCtrl.listCustomers)
router.get('/customers/:id/orders', adminRequired, userCtrl.getCustomerOrders)
router.get('/customers/:id/activities', adminRequired, activityCtrl.getUserActivities)
router.get('/customers/:id/details', adminRequired, userCtrl.getCustomerDetails)
router.get('/latest', adminRequired, userCtrl.listNewRegistrations)

export default router
