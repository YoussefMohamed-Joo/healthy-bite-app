import logger from '../utils/logger.js'
import config from '../config/index.js'

export default function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500
  const message = err.isOperational ? err.message : 'Internal server error'

  if (!err.isOperational) {
    logger.error(`Unhandled error: ${err.message}`, { stack: err.stack, url: req.originalUrl })
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(config.env === 'development' && { stack: err.stack }),
  })
}
