import { body } from 'express-validator'
import validate from '../middleware/validate.js'
import * as authService from '../services/authService.js'
import catchAsync from '../utils/catchAsync.js'

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
]

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
]

export const register = catchAsync(async (req, res) => {
  const result = await authService.registerUser(req.body)
  res.status(201).json({ status: 'success', ...result })
})

export const login = catchAsync(async (req, res) => {
  const result = await authService.loginUser(req.body)
  res.json({ status: 'success', ...result })
})

export const getMe = catchAsync(async (req, res) => {
  const user = await authService.getProfile(req.userId)
  res.json({ status: 'success', user })
})
