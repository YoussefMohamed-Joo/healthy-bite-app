import Redis from 'ioredis'
import logger from './logger.js'

const REDIS_URL = process.env.REDIS_URL || ''
const DEFAULT_TTL = 300 // 5 minutes

let redis = null
let enabled = false

if (REDIS_URL) {
  try {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null
        return Math.min(times * 200, 2000)
      },
      lazyConnect: true,
    })

    redis.on('error', (err) => {
      logger.warn(`Redis error: ${err.message}`)
      enabled = false
    })

    redis.on('ready', () => {
      logger.info('Redis connected')
      enabled = true
    })

    redis.connect().catch(() => { enabled = false })
  } catch (err) {
    logger.warn(`Redis init failed: ${err.message}`)
  }
} else {
  logger.info('Redis not configured — caching disabled')
}

export async function cacheGet(key) {
  if (!enabled || !redis) return null
  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export async function cacheSet(key, data, ttl = DEFAULT_TTL) {
  if (!enabled || !redis) return
  try {
    await redis.setex(key, ttl, JSON.stringify(data))
  } catch { /* silent */ }
}

export async function cacheDel(pattern) {
  if (!enabled || !redis) return
  try {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) await redis.del(...keys)
  } catch { /* silent */ }
}

export async function cacheDelKey(key) {
  if (!enabled || !redis) return
  try { await redis.del(key) } catch { /* silent */ }
}

export { redis, enabled }
