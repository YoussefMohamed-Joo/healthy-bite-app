import logger from '../utils/logger.js'
import config from '../config/index.js'

export default function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500

  logger.error(`Error: ${err.message}`, { stack: err.stack, url: req.originalUrl })

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal server error',
  })
}
