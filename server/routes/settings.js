import { Router } from 'express'
import * as settingCtrl from '../controllers/siteSettingController.js'
import { adminRequired } from '../middleware/auth.js'

const router = Router()

router.get('/', settingCtrl.getByKeys)
router.put('/', adminRequired, settingCtrl.upsert)

export default router
