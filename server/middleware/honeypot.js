import ApiError from '../utils/ApiError.js'
export default (req, res, next) => {
  if (req.body && req.body.website_url) {
    console.log('Honeypot triggered, spam detected')
    return res.json({ status: 'success', message: 'تم استلام طلبك' })
  }
  next()
}
