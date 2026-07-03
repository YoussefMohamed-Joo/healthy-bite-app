import { Router } from 'express'
import * as notifCtrl from '../controllers/notificationController.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

router.get('/', authRequired, notifCtrl.getMyNotifications)
router.put('/:id/read', authRequired, notifCtrl.markAsRead)
router.put('/read-all', authRequired, notifCtrl.markAllAsRead)

export default router
