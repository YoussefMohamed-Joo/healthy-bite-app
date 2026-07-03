import { Router } from 'express'
import * as planCtrl from '../controllers/planController.js'
import { adminRequired } from '../middleware/auth.js'

const router = Router()

router.get('/', planCtrl.list)
router.post('/', adminRequired, planCtrl.create)
router.put('/:id', adminRequired, planCtrl.update)
router.delete('/:id', adminRequired, planCtrl.remove)

export default router
