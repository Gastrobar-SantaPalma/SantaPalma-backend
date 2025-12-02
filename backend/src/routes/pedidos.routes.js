import express from 'express'
import { 
    getPedidos, 
    getPedidoById,
    getPedidosDelCliente,
    createPedido,
    updatePedido,
    deletePedido,
    updatePedidoEstado,
    updatePedidoMesa,
    updatePedidoPago     
} from '../controllers/pedidos.controller.js'

import { authMiddleware, requireAnyRole } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import { createPedidoSchema, updatePedidoSchema } from '../schemas/pedido.schema.js'
import { ordersByStatus } from '../controllers/reportes.controller.js'

const router = express.Router()
import { pedidosCountByDay } from '../controllers/reportes.controller.js'

// List client orders
router.get(
  '/cliente/mis-pedidos',
  authMiddleware,
  requireAnyRole('cliente', 'staff', 'admin'),
  getPedidosDelCliente
)

// List pedidos (staff/admin)
// Endpoints para estadisticas/reportes usados por el admin frontend (public)
// Deben estar antes de '/:id' para no ser atrapadas por el parámetro
router.get('/count-by-day', pedidosCountByDay)
router.get('/status-count', async (req, res) => {
  try { await ordersByStatus(req, res) } catch (e) { res.json({}) }
})
router.get('/status', async (req, res) => { try { await ordersByStatus(req, res) } catch (e) { res.json({}) } })

// List pedidos (staff/admin)
router.get('/', authMiddleware, requireAnyRole('staff', 'admin'), getPedidos)
router.get('/:id', authMiddleware, getPedidoById)


// Create and modify orders
router.post('/', authMiddleware, validate(createPedidoSchema), createPedido)
router.put('/:id', authMiddleware, validate(updatePedidoSchema), updatePedido)
router.delete('/:id', authMiddleware, requireAnyRole('admin', 'staff'), deletePedido)

// Staff endpoints to change estado and mesa
router.patch('/:id/estado', authMiddleware, requireAnyRole('staff', 'admin'), updatePedidoEstado)
router.patch('/:id/mesa', authMiddleware, requireAnyRole('staff', 'admin'), updatePedidoMesa)

// NUEVA RUTA: actualizar pago
router.patch('/:id/pago', authMiddleware, requireAnyRole('staff', 'admin'), updatePedidoPago)

// Endpoints para estadisticas/reportes usados por el admin frontend
// Público: retornan datos agregados
router.get('/count-by-day', pedidosCountByDay)
router.get('/status-count', async (req, res) => {
  // Prefer the richer ordersByStatus if available
  try {
    const result = await ordersByStatus(req, res)
    // ordersByStatus sends response itself
  } catch (e) {
    res.json({})
  }
})
router.get('/status', async (req, res) => {
  try {
    await ordersByStatus(req, res)
  } catch (e) {
    res.json({})
  }
})

export default router
