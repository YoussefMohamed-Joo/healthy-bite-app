import { getCached, setCache } from '../config/redis.js'

export async function getOrCache(key, fetcher, ttl = 300) {
  const cached = await getCached(key)
  if (cached) return cached

  const data = await fetcher()
  await setCache(key, data, ttl)
  return data
}

export function cacheMiddleware(ttl = 300) {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`
    const cached = await getCached(key)
    if (cached) return res.json(cached)

    const originalJson = res.json.bind(res)
    res.json = async (body) => {
      await setCache(key, body, ttl)
      originalJson(body)
    }
    next()
  }
}
