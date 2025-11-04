import express from 'express'
import { getPedidoDebug, updatePedidoDebug } from '../controllers/debug.controller.js'

const router = express.Router()

// Debug endpoints (no auth) - remove before production
router.get('/pedidos/:id', getPedidoDebug)
router.post('/pedidos/:id/update', updatePedidoDebug)

export default router
