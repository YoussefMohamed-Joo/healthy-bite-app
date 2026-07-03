import { Router } from 'express'
import * as addressCtrl from '../controllers/addressController.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

router.get('/', authRequired, addressCtrl.getMyAddresses)
router.post('/', authRequired, addressCtrl.createAddress)
router.put('/:id', authRequired, addressCtrl.updateAddress)
router.delete('/:id', authRequired, addressCtrl.deleteAddress)

export default router
