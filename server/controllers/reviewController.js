import prisma from '../services/prisma.js'
import catchAsync from '../utils/catchAsync.js'
import ApiError from '../utils/ApiError.js'

export const getProductReviews = catchAsync(async (req, res) => {
  const { productId } = req.params
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limit

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where: { productId } }),
  ])

  const stats = await prisma.review.groupBy({
    by: ['rating'],
    where: { productId },
    _count: { rating: true },
  })

  const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  stats.forEach(s => { ratings[s.rating] = s._count.rating })

  res.json({
    status: 'success',
    data: reviews,
    stats: { average: total ? reviews.reduce((a, r) => a + r.rating, 0) / total : 0, total, ratings },
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
})

export const createReview = catchAsync(async (req, res, next) => {
  const { productId, rating, comment } = req.body
  if (!productId || !rating) return next(new ApiError('المنتج والتقييم مطلوبان', 400))
  if (rating < 1 || rating > 5) return next(new ApiError('التقييم من 1 لـ 5', 400))

  const existing = await prisma.review.findFirst({
    where: { userId: req.userId, productId },
  })
  if (existing) return next(new ApiError('قيمت هذا المنتج من قبل', 400))

  const review = await prisma.review.create({
    data: { userId: req.userId, productId, rating, comment },
  })

  res.status(201).json({ status: 'success', data: review })
})

export const updateReview = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const { rating, comment } = req.body

  const review = await prisma.review.findUnique({ where: { id } })
  if (!review) return next(new ApiError('التقييم غير موجود', 404))
  if (review.userId !== req.userId) return next(new ApiError('غير مصرح', 403))

  const updated = await prisma.review.update({
    where: { id },
    data: { ...(rating && { rating }), ...(comment !== undefined && { comment }) },
  })

  res.json({ status: 'success', data: updated })
})

export const deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const review = await prisma.review.findUnique({ where: { id } })
  if (!review) return next(new ApiError('التقييم غير موجود', 404))
  if (review.userId !== req.userId && req.userRole !== 'admin') return next(new ApiError('غير مصرح', 403))

  await prisma.review.delete({ where: { id } })
  res.json({ status: 'success', message: 'تم حذف التقييم' })
})
