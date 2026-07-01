import { body } from 'express-validator'
import validate from '../middleware/validate.js'
import * as orderService from '../services/orderService.js'
import catchAsync from '../utils/catchAsync.js'

export const createOrderValidation = [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('customerPhone').trim().notEmpty().withMessage('Customer phone is required'),
  body('customerAddress').trim().notEmpty().withMessage('Customer address is required'),
  validate,
]

export const list = catchAsync(async (req, res) => {
  const result = await orderService.listOrders(req.query, req.userId, req.user?.role)
  res.json({ status: 'success', ...result })
})

export const create = catchAsync(async (req, res) => {
  const order = await orderService.createOrder(req.body, req.userId)
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
