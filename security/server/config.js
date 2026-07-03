import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function loadKey(keyPath, envVar) {
  if (process.env[envVar]) {
    return Buffer.from(process.env[envVar], 'base64').toString('utf-8')
  }
  const filePath = path.join(__dirname, '..', keyPath)
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8')
  }
  return null
}

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/healthybite',
  jwtSecret: process.env.JWT_SECRET || 'hb-jwt-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtPrivateKey: loadKey('keys/private.pem', 'RSA_PRIVATE_KEY'),
  jwtPublicKey: loadKey('keys/public.pem', 'RSA_PUBLIC_KEY'),
  jwtAlgorithm: 'RS256',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  redis: {
    url: process.env.REDIS_URL || '',
    enabled: !!process.env.REDIS_URL,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
}

export default config
