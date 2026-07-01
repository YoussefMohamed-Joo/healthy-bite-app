import mongoose from 'mongoose'
import config from './index.js'
import logger from '../utils/logger.js'

export default async function connectDB() {
  try {
    const conn = await mongoose.connect(config.mongoUri)
    logger.info(`MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`)
    process.exit(1)
  }

  mongoose.connection.on('error', (err) => logger.error(`MongoDB error: ${err.message}`))
  mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'))
}
