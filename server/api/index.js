import mongoose from 'mongoose'
import config from '../config/index.js'

let connected = false

export default async function handler(req, res) {
  if (!connected) {
    if (!process.env.MONGO_URI) {
      connected = true
      return res.status(503).json({ status: 'error', message: 'MONGO_URI not set — configure in Vercel env vars' })
    }
    try {
      await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 })
      connected = true
      console.log('DB connected')
    } catch (err) {
      return res.status(503).json({ status: 'error', message: `DB connection failed: ${err.message}` })
    }
  }

  const { default: app } = await import('../app.js')
  app(req, res)
}
