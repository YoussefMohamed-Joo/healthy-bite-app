import prisma from '../services/prisma.js'
import catchAsync from '../utils/catchAsync.js'
import ApiError from '../utils/ApiError.js'

export const getMyAddresses = catchAsync(async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  })
  res.json({ status: 'success', data: addresses })
})

export const createAddress = catchAsync(async (req, res, next) => {
  const { label, fullName, phone, street, city, notes, isDefault } = req.body
  if (!fullName || !phone || !street) return next(new ApiError('الاسم والموبايل والعنوان مطلوبون', 400))

  if (isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.userId },
      data: { isDefault: false },
    })
  }

  const address = await prisma.address.create({
    data: { userId: req.userId, label, fullName, phone, street, city, notes, isDefault: isDefault || false },
  })

  res.status(201).json({ status: 'success', data: address })
})

export const updateAddress = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const existing = await prisma.address.findUnique({ where: { id } })
  if (!existing) return next(new ApiError('العنوان غير موجود', 404))
  if (existing.userId !== req.userId) return next(new ApiError('غير مصرح', 403))

  if (req.body.isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.userId, id: { not: id } },
      data: { isDefault: false },
    })
  }

  const updated = await prisma.address.update({
    where: { id },
    data: req.body,
  })

  res.json({ status: 'success', data: updated })
})

export const deleteAddress = catchAsync(async (req, res, next) => {
  const { id } = req.params
  const existing = await prisma.address.findUnique({ where: { id } })
  if (!existing) return next(new ApiError('العنوان غير موجود', 404))
  if (existing.userId !== req.userId) return next(new ApiError('غير مصرح', 403))

  await prisma.address.delete({ where: { id } })
  res.json({ status: 'success', message: 'تم حذف العنوان' })
})
