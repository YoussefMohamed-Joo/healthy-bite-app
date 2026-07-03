import 'express-async-errors'
import * as Sentry from '@sentry/node'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import mongoSanitize from 'express-mongo-sanitize'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import { Server } from 'socket.io'

import config from './config/index.js'
import logger from './utils/logger.js'
import errorHandler from './middleware/errorHandler.js'
import { globalLimiter } from './middleware/ratelimit.js'

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
  'https://client-one-cyan-92.vercel.app',
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

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}))
app.use(cors(corsOptions))
app.use(globalLimiter)
app.use(cookieParser())
app.use(mongoSanitize())

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

if (config.env !== 'test') app.use(morgan('dev'))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/health', (_, res) => res.json({ status: 'success', uptime: process.uptime() }))

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

app.use((_, res) => res.status(404).json({ status: 'error', message: 'Route not found' }))
if (process.env.SENTRY_DSN) app.use(Sentry.Handlers.errorHandler())
app.use(errorHandler)

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`)
  socket.on('join-admin', () => socket.join('admin-room'))

  // Chat rooms
  socket.on('chat:join', (chatId) => {
    socket.join(`chat:${chatId}`)
    logger.info(`Socket ${socket.id} joined chat:${chatId}`)
  })

  socket.on('chat:leave', (chatId) => {
    socket.leave(`chat:${chatId}`)
  })

  socket.on('chat:typing', (data) => {
    socket.to(`chat:${data.chatId}`).emit('chat:typing', {
      chatId: data.chatId,
      userId: data.userId,
      isTyping: data.isTyping,
    })
  })

  socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`))
})

export default app
export { server, io }
