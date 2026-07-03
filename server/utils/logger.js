import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'
import { fileURLToPath } from 'url'
import config from '../config/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logsDir = path.join(__dirname, '..', 'logs')

const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: config.env === 'production'
        ? winston.format.json()
        : winston.format.printf(({ timestamp, level, message, stack }) =>
            `${timestamp} [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`),
    }),
  ],
})

if (config.env === 'production') {
  logger.add(new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: '30d',
    zippedArchive: true,
  }))

  logger.add(new DailyRotateFile({
    filename: path.join(logsDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',
    zippedArchive: true,
  }))
}

export default logger
