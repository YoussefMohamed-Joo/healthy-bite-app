import ActivityLog from '../models/ActivityLog.js'

export async function logActivity(userId, action, details = '', orderId = null) {
  return ActivityLog.create({ user: userId, action, details, orderId })
}
