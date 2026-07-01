import config from '../config/index.js'
import Stripe from 'stripe'
import logger from '../utils/logger.js'

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

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret)
    return event
  } catch (err) {
    logger.error(`Stripe webhook error: ${err.message}`)
    throw err
  }
}
