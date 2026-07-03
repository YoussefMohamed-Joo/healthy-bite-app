import Plan from '../models/Plan.js'
import catchAsync from '../utils/catchAsync.js'

export const list = catchAsync(async (req, res) => {
  const plans = await Plan.find({ active: true }).sort('price').lean()
  res.json({ status: 'success', data: plans })
})

export const create = catchAsync(async (req, res) => {
  const plan = await Plan.create(req.body)
  res.status(201).json({ status: 'success', data: plan })
})

export const update = catchAsync(async (req, res) => {
  const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!plan) return res.status(404).json({ status: 'error', message: 'Plan not found' })
  res.json({ status: 'success', data: plan })
})

export const remove = catchAsync(async (req, res) => {
  const plan = await Plan.findByIdAndDelete(req.params.id)
  if (!plan) return res.status(404).json({ status: 'error', message: 'Plan not found' })
  res.json({ status: 'success', message: 'Plan deleted' })
})
