import { Router } from 'express'
import * as faqCtrl from '../controllers/faqController.js'
import { adminRequired } from '../middleware/auth.js'

const router = Router()

router.get('/', faqCtrl.list)
router.post('/', adminRequired, faqCtrl.create)
router.put('/:id', adminRequired, faqCtrl.update)
router.delete('/:id', adminRequired, faqCtrl.remove)

export default router
