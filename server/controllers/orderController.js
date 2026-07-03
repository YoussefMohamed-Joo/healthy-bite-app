import { body } from 'express-validator'
import validate from '../middleware/validate.js'
import * as orderService from '../services/orderService.js'
import catchAsync from '../utils/catchAsync.js'
import { getImageUrl, getImagePublicId } from '../middleware/upload.js'

export const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('customerPhone').trim().notEmpty().withMessage('Customer phone is required'),
  body('customerAddress').trim().notEmpty().withMessage('Customer address is required'),
  body('email').optional().isEmail().withMessage('Valid email is required for notifications'),
  validate,
]

export const list = catchAsync(async (req, res) => {
  const result = await orderService.listOrders(req.query, req.userId, req.user?.role)
  res.json({ status: 'success', ...result })
})

export const create = catchAsync(async (req, res) => {
  const data = { ...req.body }

  if (typeof data.items === 'string') data.items = JSON.parse(data.items)
  if (typeof data.total === 'string') data.total = parseFloat(data.total)

  if (req.file) {
    data.receiptImage = getImageUrl(req.file)
  }

  const order = await orderService.createOrder(data, req.userId)
  const io = req.app.get('io')
  if (io) io.emit('new-order', { message: 'New order received!', order })
  res.status(201).json({ status: 'success', data: order })
})

export const updateStatus = catchAsync(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status, req.user?.role)
  const io = req.app.get('io')
  if (io) io.emit('order-status-update', { message: `Order ${order.status}`, order })
  res.json({ status: 'success', data: order })
})

export const verifyPayment = catchAsync(async (req, res) => {
  const order = await orderService.verifyPayment(req.params.id)
  const io = req.app.get('io')
  if (io) io.emit('order-status-update', { message: 'Payment verified', order })
  res.json({ status: 'success', data: order })
})

export const rejectPayment = catchAsync(async (req, res) => {
  const order = await orderService.rejectPayment(req.params.id, req.body.reason)
  const io = req.app.get('io')
  if (io) io.emit('order-status-update', { message: 'Payment rejected', order })
  res.json({ status: 'success', data: order })
})

export const listPaymentPending = catchAsync(async (req, res) => {
  const orders = await orderService.getPaymentPendingOrders()
  res.json({ status: 'success', data: orders })
})
