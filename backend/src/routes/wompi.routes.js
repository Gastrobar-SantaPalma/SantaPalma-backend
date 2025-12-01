import { Router } from 'express'
import { authMiddleware } from '../middlewares/auth.middleware.js'
import { crearTransaccion, webhookWompi } from '../controllers/wompi.controller.js'

const router = Router()

// Crear link de pago
router.post('/crear-transaccion', authMiddleware, crearTransaccion)

// Webhook de Wompi
router.post('/webhook', webhookWompi)

export default router
