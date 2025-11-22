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

const router = express.Router()

// List client orders
router.get(
  '/cliente/mis-pedidos',
  authMiddleware,
  requireAnyRole('cliente', 'staff', 'admin'),
  getPedidosDelCliente
)

// List pedidos (staff/admin)
router.get('/', authMiddleware, requireAnyRole('staff', 'admin'), getPedidos)
router.get('/:id', authMiddleware, getPedidoById)




// Create and modify orders
router.post('/', authMiddleware, createPedido)
router.put('/:id', authMiddleware, updatePedido)
router.delete('/:id', authMiddleware, requireAnyRole('admin', 'staff'), deletePedido)

// Staff endpoints to change estado and mesa
router.patch('/:id/estado', authMiddleware, requireAnyRole('staff', 'admin'), updatePedidoEstado)
router.patch('/:id/mesa', authMiddleware, requireAnyRole('staff', 'admin'), updatePedidoMesa)

// NUEVA RUTA: actualizar pago
router.patch('/:id/pago', authMiddleware, requireAnyRole('staff', 'admin'), updatePedidoPago)

export default router
