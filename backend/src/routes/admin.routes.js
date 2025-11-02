import express from 'express'
import { createAdmin, changeUserRole } from '../controllers/admin.controller.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Admin-only: create another admin (requires an authenticated admin)
router.post('/create', authMiddleware, requireRole('admin'), createAdmin)

// Admin-only: change user's role
router.put('/users/:id/role', authMiddleware, requireRole('admin'), changeUserRole)

export default router
