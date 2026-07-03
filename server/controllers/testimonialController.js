import Testimonial from '../models/Testimonial.js'
import catchAsync from '../utils/catchAsync.js'

export const list = catchAsync(async (req, res) => {
  const testimonials = await Testimonial.find({ active: true }).sort('-createdAt').lean()
  res.json({ status: 'success', data: testimonials })
})

export const create = catchAsync(async (req, res) => {
  const testimonial = await Testimonial.create(req.body)
  res.status(201).json({ status: 'success', data: testimonial })
})

export const update = catchAsync(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!testimonial) return res.status(404).json({ status: 'error', message: 'Testimonial not found' })
  res.json({ status: 'success', data: testimonial })
})

export const remove = catchAsync(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id)
  if (!testimonial) return res.status(404).json({ status: 'error', message: 'Testimonial not found' })
  res.json({ status: 'success', message: 'Testimonial deleted' })
})
