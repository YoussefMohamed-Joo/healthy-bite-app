import { Router } from 'express'
import * as testimonialCtrl from '../controllers/testimonialController.js'
import { adminRequired } from '../middleware/auth.js'

const router = Router()

router.get('/', testimonialCtrl.list)
router.post('/', adminRequired, testimonialCtrl.create)
router.put('/:id', adminRequired, testimonialCtrl.update)
router.delete('/:id', adminRequired, testimonialCtrl.remove)

export default router
