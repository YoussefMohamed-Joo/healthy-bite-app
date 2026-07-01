import { body, param } from 'express-validator'
import validate from '../middleware/validate.js'
import * as productService from '../services/productService.js'
import catchAsync from '../utils/catchAsync.js'
import { getImageUrl, getImagePublicId } from '../middleware/upload.js'

export const productValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('nameAr').trim().notEmpty().withMessage('Arabic name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('calories').isInt({ min: 0 }).withMessage('Calories must be a positive integer'),
  validate,
]

export const list = catchAsync(async (req, res) => {
  const result = await productService.listProducts(req.query)
  res.json({ status: 'success', ...result })
})

export const get = catchAsync(async (req, res) => {
  const product = await productService.getProduct(req.params.id)
  res.json({ status: 'success', data: product })
})

export const create = catchAsync(async (req, res) => {
  const data = { ...req.body }
  data.image = getImageUrl(req.file)
  data.imagePublicId = getImagePublicId(req.file)
  const product = await productService.createProduct(data)
  res.status(201).json({ status: 'success', data: product })
})

export const update = catchAsync(async (req, res) => {
  const data = { ...req.body }
  if (req.file) {
    data.image = getImageUrl(req.file)
    data.imagePublicId = getImagePublicId(req.file)
  }
  const product = await productService.updateProduct(req.params.id, data)
  res.json({ status: 'success', data: product })
})

export const remove = catchAsync(async (req, res) => {
  const product = await productService.deleteProduct(req.params.id)
  res.json({ status: 'success', message: 'Product deleted', data: product })
})
