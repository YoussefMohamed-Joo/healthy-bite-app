import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import { Server } from 'socket.io'

import config from './config/index.js'
import logger from './utils/logger.js'
import errorHandler from './middleware/errorHandler.js'
import rateLimiter from './middleware/ratelimit.js'

import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import orderRoutes from './routes/orders.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: { origin: config.cors.origin, methods: ['GET', 'POST', 'PUT', 'DELETE'] },
  pingTimeout: 60000,
  pingInterval: 25000,
})

app.set('io', io)

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: config.cors.origin }))
app.use(rateLimiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Logging
if (config.env !== 'test') app.use(morgan('dev'))

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Health
app.get('/health', (_, res) => res.json({ status: 'success', uptime: process.uptime() }))

// Routes
app.use('/auth', authRoutes)
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)

// 404
app.use((_, res) => res.status(404).json({ status: 'error', message: 'Route not found' }))

// Error handler
app.use(errorHandler)

// Socket.io
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`)
  socket.on('join-admin', () => socket.join('admin-room'))
  socket.on('disconnect', () => logger.info(`Socket disconnected: ${socket.id}`))
})

export default app
export { server, io }
