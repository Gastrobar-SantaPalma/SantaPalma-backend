import express from 'express'
import { getEventos } from '../controllers/auditoria.controller.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'

const router = express.Router()

// Only admins should see audit logs
router.get('/', authMiddleware, requireRole('admin'), getEventos)

export default router
