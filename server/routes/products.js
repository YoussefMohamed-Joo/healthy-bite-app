import { Router } from 'express'
import * as productCtrl from '../controllers/productController.js'
import { adminRequired } from '../middleware/auth.js'
import { uploadSingle } from '../middleware/upload.js'

const router = Router()

router.get('/', productCtrl.list)
router.get('/:id', productCtrl.get)
router.post('/', adminRequired, uploadSingle, productCtrl.productValidation, productCtrl.create)
router.put('/:id', adminRequired, uploadSingle, productCtrl.update)
router.delete('/:id', adminRequired, productCtrl.remove)

export default router
