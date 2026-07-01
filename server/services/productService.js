import Product from '../models/Product.js'
import { getCached, setCache, clearCache } from '../config/redis.js'
import ApiError from '../utils/ApiError.js'
import { paginate, buildFilter } from '../utils/helpers.js'

export async function listProducts(query) {
  const { page, limit, skip } = paginate(query.page, query.limit)
  const filter = buildFilter(query, ['category', 'available'])

  // Try cache
  const cacheKey = `products:${JSON.stringify({ ...filter, page, limit })}`
  const cached = await getCached(cacheKey)
  if (cached) return cached

  const [products, total] = await Promise.all([
    Product.find(filter).sort('-createdAt').skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ])

  const result = {
    data: products,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }

  await setCache(cacheKey, result, 120)
  return result
}

export async function getProduct(id) {
  const product = await Product.findById(id)
  if (!product) throw new ApiError(404, 'Product not found')
  return product
}

export async function createProduct(data, file) {
  const product = await Product.create({
    ...data,
    price: parseFloat(data.price),
    calories: parseInt(data.calories, 10),
  })
  await clearCache('products:*')
  return product
}

export async function updateProduct(id, data, file) {
  const update = { ...data }
  if (data.price) update.price = parseFloat(data.price)
  if (data.calories) update.calories = parseInt(data.calories, 10)

  const product = await Product.findByIdAndUpdate(id, update, { new: true, runValidators: true })
  if (!product) throw new ApiError(404, 'Product not found')

  await clearCache('products:*')
  return product
}

export async function deleteProduct(id) {
  const product = await Product.findByIdAndDelete(id)
  if (!product) throw new ApiError(404, 'Product not found')
  await clearCache('products:*')
  return product
}
