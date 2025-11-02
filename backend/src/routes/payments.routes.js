import express from 'express'
import { createPayment } from '../controllers/payments.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Create payment (authenticated)
router.post('/create', authMiddleware, createPayment)

export default router
