import ActivityLog from '../models/ActivityLog.js'
import catchAsync from '../utils/catchAsync.js'

export const getUserActivities = catchAsync(async (req, res) => {
  const activities = await ActivityLog.find({ user: req.params.id })
    .sort('-createdAt')
    .lean()
  res.json({ status: 'success', data: activities })
})
