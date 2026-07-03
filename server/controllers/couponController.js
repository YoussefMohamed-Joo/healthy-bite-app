import Coupon from '../models/Coupon.js'
import catchAsync from '../utils/catchAsync.js'
import ApiError from '../utils/ApiError.js'

export const list = catchAsync(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt')
  res.json({ status: 'success', data: coupons })
})

export const create = catchAsync(async (req, res) => {
  const { code, type, discount, minOrder, maxUses, expiresAt } = req.body
  if (!code || discount === undefined) throw new ApiError(400, 'Code and discount are required')

  const existing = await Coupon.findOne({ code: code.toUpperCase() })
  if (existing) throw new ApiError(400, 'كود الخصم موجود بالفعل')

  const coupon = await Coupon.create({ code: code.toUpperCase(), type, discount, minOrder, maxUses, expiresAt })
  res.status(201).json({ status: 'success', data: coupon })
})

export const update = catchAsync(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!coupon) throw new ApiError(404, 'Coupon not found')
  res.json({ status: 'success', data: coupon })
})

export const remove = catchAsync(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id)
  if (!coupon) throw new ApiError(404, 'Coupon not found')
  res.json({ status: 'success', message: 'Coupon deleted' })
})

export const validate = catchAsync(async (req, res) => {
  const { code, orderTotal } = req.body
  if (!code) throw new ApiError(400, 'Code is required')

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), active: true })
  if (!coupon) throw new ApiError(400, 'كود الخصم غير صالح')

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new ApiError(400, 'انتهت صلاحية كود الخصم')
  }

  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    throw new ApiError(400, 'تم استنفاذ عدد مرات استخدام الكود')
  }

  const minOrder = coupon.minOrder || 0
  if (orderTotal < minOrder) {
    throw new ApiError(400, `الحد الأدنى للطلب لاستخدام الكود ${minOrder} $`)
  }

  let discountAmount = 0
  if (coupon.type === 'percentage') {
    discountAmount = (orderTotal * coupon.discount) / 100
  } else {
    discountAmount = coupon.discount
  }

  discountAmount = Math.min(discountAmount, orderTotal)

  res.json({
    status: 'success',
    data: {
      code: coupon.code,
      type: coupon.type,
      discount: coupon.discount,
      discountAmount: Math.round(discountAmount * 100) / 100,
    },
  })
})
