import connectDB from './config/db.js'
import logger from './utils/logger.js'
import config from './config/index.js'
import { server } from './app.js'

async function start() {
  await connectDB()
  server.listen(config.port, () => {
    logger.info(`Server running on http://localhost:${config.port} [${config.env}]`)
    logger.info(`Redis: ${config.redis.enabled ? 'enabled' : 'disabled'}`)
    logger.info(`Stripe: ${config.stripe.secretKey ? 'enabled' : 'disabled'}`)
    logger.info(`Cloudinary: ${config.cloudinary.cloudName ? 'enabled' : 'disabled'}`)
  })
}

start().catch((err) => {
  logger.error(`Failed to start: ${err.message}`)
  process.exit(1)
})
