import winston from 'winston'
import config from '../config/index.js'

const logger = winston.createLogger({
  level: config.env === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    config.env === 'production'
      ? winston.format.json()
      : winston.format.printf(({ timestamp, level, message, stack }) =>
          `${timestamp} [${level.toUpperCase()}] ${message}${stack ? '\n' + stack : ''}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error', maxsize: 5242880 }),
    new winston.transports.File({ filename: 'logs/combined.log', maxsize: 5242880 }),
  ],
})

export default logger
