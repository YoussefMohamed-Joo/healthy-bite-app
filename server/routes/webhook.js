import { Router } from 'express'
import express from 'express'
import { handleWebhook } from '../services/paymentService.js'

const router = Router()

router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature']
    if (!sig) return res.status(400).json({ status: 'error', message: 'Missing stripe-signature header' })

    const event = await handleWebhook(req.body, sig)
    res.json({ status: 'success', received: true, type: event.type || 'skipped' })
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message })
  }
})

export default router
