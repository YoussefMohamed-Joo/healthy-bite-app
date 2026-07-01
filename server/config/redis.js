import Redis from 'ioredis'
import config from './index.js'
import logger from '../utils/logger.js'

let redis = null

if (config.redis.enabled) {
  redis = new Redis(config.redis.url, {
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  })

  redis.on('error', (err) => logger.warn(`Redis error: ${err.message}`))
  redis.on('connect', () => logger.info('Redis connected'))
}

export async function getCached(key) {
  if (!redis) return null
  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch { return null }
}

export async function setCache(key, data, ttl = 300) {
  if (!redis) return
  try {
    await redis.setex(key, ttl, JSON.stringify(data))
  } catch { /* silent */ }
}

export async function clearCache(pattern) {
  if (!redis) return
  try {
    const keys = await redis.keys(pattern)
    if (keys.length) await redis.del(...keys)
  } catch { /* silent */ }
}

export default redis
