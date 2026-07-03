import SiteSetting from '../models/SiteSetting.js'
import catchAsync from '../utils/catchAsync.js'

export const getByKeys = catchAsync(async (req, res) => {
  const keys = req.query.keys ? req.query.keys.split(',') : []
  if (keys.length === 0) return res.json({ status: 'success', data: {} })

  const settings = await SiteSetting.find({ key: { $in: keys } }).lean()
  const map = {}
  settings.forEach(s => { map[s.key] = s.value })
  res.json({ status: 'success', data: map })
})

export const upsert = catchAsync(async (req, res) => {
  const { key, value, label } = req.body
  if (!key) return res.status(400).json({ status: 'error', message: 'Key is required' })

  const setting = await SiteSetting.findOneAndUpdate(
    { key },
    { value, label: label || '' },
    { upsert: true, new: true, runValidators: true }
  )
  res.json({ status: 'success', data: setting })
})

export const list = catchAsync(async (req, res) => {
  const settings = await SiteSetting.find().lean()
  res.json({ status: 'success', data: settings })
})
