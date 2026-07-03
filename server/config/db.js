import mongoose from 'mongoose'
import config from './index.js'
import logger from '../utils/logger.js'

let cached = global.mongoose
if (!cached) cached = global.mongoose = { conn: null, promise: null }

export default async function connectDB() {
  if (cached.conn) return cached.conn
  if (cached.promise) return cached.promise

  cached.promise = mongoose.connect(config.mongoUri).then(conn => {
    logger.info(`MongoDB connected: ${conn.connection.host}`)
    cached.conn = conn
    return conn
  }).catch(err => {
    logger.error(`MongoDB error: ${err.message}`)
    cached.promise = null
    return null
  })

  return cached.promise
}
