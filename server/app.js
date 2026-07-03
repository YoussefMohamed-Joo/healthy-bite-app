import 'express-async-errors'
import * as Sentry from '@sentry/node'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import mongoSanitize from 'express-mongo-sanitize'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import { Server } from 'socket.io'

import config from './config/index.js'
import logger from './utils/logger.js'
import errorHandler from './middleware/errorHandler.js'
import { globalLimiter, authLimiter } from './middleware/ratelimit.js'
import honeypot from './middleware/honeypot.js'

import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'
import userRoutes from './routes/users.js'
import planRoutes from './routes/plans.js'
import testimonialRoutes from './routes/testimonials.js'
import dashboardRoutes from './routes/dashboard.js'
import faqRoutes from './routes/faq.js'
import settingRoutes from './routes/settings.js'
import otpRoutes from './routes/otp.js'
import couponRoutes from './routes/coupons.js'
import webhookRoutes from './routes/webhook.js'
import chatRoutes from './routes/chat.js'
import aiRoutes from './routes/ai.js'
import mobileRoutes from './routes/mobile.js'
import downloadRoutes from './routes/download.js'
import trackingRoutes from './routes/tracking.js'
import contactRoutes from './routes/contact.js'
import reviewRoutes from './routes/reviews.js'
import addressRoutes from './routes/addresses.js'
import notificationRoutes from './routes/notifications.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, environment: config.env, tracesSampleRate: 0.2 })
  logger.info('Sentry initialized')
}

const app = express()
const server = http.createServer(app)

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://helthybite.vercel.app',
  'https://healthybite-server.vercel.app',
]

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o)) || /\.vercel\.app$/.test(origin)) {
      cb(null, true)
    } else {
      cb(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}

const io = new Server(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
})

app.set('io', io)

if (process.env.SENTRY_DSN) app.use(Sentry.Handlers.requestHandler())

// ───── Security Headers ─────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
}))

app.use(cors(corsOptions))

// ───── Rate Limiting ─────
app.use(globalLimiter)

// ───── Body Parsers ─────
app.use(cookieParser())
app.use(express.json({ limit: '512kb' }))
app.use(express.urlencoded({ extended: true, limit: '512kb' }))

// ───── Compression ─────
app.use(compression({ level: 6, threshold: 1024 }))

// ───── Sanitization ─────
app.use(mongoSanitize())

// ───── Request logging ─────
if (config.env !== 'test') app.use(morgan('short'))

// ───── Honeypot anti-bot ─────
app.use('/auth', honeypot)

// ───── Static files ─────
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { maxAge: '7d', immutable: true }))

// ───── Health ─────
app.get('/health', (_, res) => res.json({ status: 'success', uptime: process.uptime(), timestamp: Date.now() }))

// ───── API Routes ─────
app.use('/auth', authRoutes)
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/users', userRoutes)
app.use('/plans', planRoutes)
app.use('/testimonials', testimonialRoutes)
app.use('/dashboard', dashboardRoutes)
app.use('/faq', faqRoutes)
app.use('/settings', settingRoutes)
app.use('/otp', otpRoutes)
app.use('/coupons', couponRoutes)
app.use('/webhook', webhookRoutes)
app.use('/chat', chatRoutes)
app.use('/ai', aiRoutes)
app.use('/mobile', mobileRoutes)
app.use('/api/download', downloadRoutes)
app.use('/track', trackingRoutes)
app.use('/contact', contactRoutes)
app.use('/reviews', reviewRoutes)
app.use('/addresses', addressRoutes)
app.use('/notifications', notificationRoutes)

// ───── 404 ─────
app.use((_, res) => res.status(404).json({ status: 'error', message: 'Route not found' }))

// ───── Sentry error handler ─────
if (process.env.SENTRY_DSN) app.use(Sentry.Handlers.errorHandler())

// ───── Global error handler ─────
app.use(errorHandler)

// ───── Socket.io ─────
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`)
  socket.on('join-admin', () => socket.join('admin-room'))
  socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`))
})

export default app
export { server, io }
