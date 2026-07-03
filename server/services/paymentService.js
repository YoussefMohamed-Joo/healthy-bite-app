import config from '../config/index.js'
import Stripe from 'stripe'
import logger from '../utils/logger.js'
import Order from '../models/Order.js'
import { sendPaymentVerified } from './emailService.js'

let stripe = null

if (config.stripe.secretKey) {
  stripe = new Stripe(config.stripe.secretKey, { apiVersion: '2025-02-24.acacia' })
}

export async function createPaymentIntent(amount, currency = 'usd') {
  if (!stripe) {
    logger.info('Stripe not configured — returning mock payment intent')
    return { id: 'mock_pi_' + Date.now(), clientSecret: 'mock_secret_' + Date.now() }
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    automatic_payment_methods: { enabled: true },
  })

  return { id: paymentIntent.id, clientSecret: paymentIntent.client_secret }
}

export async function handleWebhook(payload, signature) {
  if (!stripe || !config.stripe.webhookSecret) return { event: 'skipped' }

  const event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret)

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object
      const orderId = pi.metadata?.orderId
      if (orderId) {
        const order = await Order.findById(orderId)
        if (order && order.status !== 'payment_pending') {
          order.status = 'preparing'
          order.paymentInfo.verified = true
          await order.save()
          if (order.email) sendPaymentVerified(order, order.email).catch(() => {})
          logger.info(`Order ${orderId} auto-verified after Stripe payment`)
        }
      }
      break
    }
    case 'charge.refunded': {
      const charge = event.data.object
      const orderId = charge.metadata?.orderId
      if (orderId) {
        logger.info(`Refund processed for order ${orderId}`)
      }
      break
    }
  }

  return event
}

export async function refundPayment(orderId) {
  if (!stripe) throw new Error('Stripe not configured')

  const order = await Order.findById(orderId)
  if (!order || !order.paymentIntentId) throw new Error('No payment intent to refund')

  const refund = await stripe.refunds.create({
    payment_intent: order.paymentIntentId,
  })

  logger.info(`Refund ${refund.id} created for order ${orderId}`)
  return refund
}
