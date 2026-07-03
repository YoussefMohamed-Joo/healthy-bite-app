import Faq from '../models/Faq.js'
import catchAsync from '../utils/catchAsync.js'

export const list = catchAsync(async (req, res) => {
  const filter = req.query.all === 'true' ? {} : { active: true }
  const faqs = await Faq.find(filter).sort('order').lean()
  res.json({ status: 'success', data: faqs })
})

export const create = catchAsync(async (req, res) => {
  const faq = await Faq.create(req.body)
  res.status(201).json({ status: 'success', data: faq })
})

export const update = catchAsync(async (req, res) => {
  const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!faq) return res.status(404).json({ status: 'error', message: 'FAQ not found' })
  res.json({ status: 'success', data: faq })
})

export const remove = catchAsync(async (req, res) => {
  const faq = await Faq.findByIdAndDelete(req.params.id)
  if (!faq) return res.status(404).json({ status: 'error', message: 'FAQ not found' })
  res.json({ status: 'success', message: 'FAQ deleted' })
})
