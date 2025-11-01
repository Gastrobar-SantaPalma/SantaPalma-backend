import express from 'express'
import { 
    getPedidos, 
    getPedidoById,
    createPedido,
    updatePedido,
    deletePedido
} from '../controllers/pedidos.controller.js'
    import { authMiddleware, requireAnyRole } from '../middlewares/auth.middleware.js'
const router = express.Router()

// List pedidos (staff/admin)
router.get('/', authMiddleware, requireAnyRole('staff', 'admin'), getPedidos)
router.get('/:id', authMiddleware, getPedidoById)
// Create and modify orders: creation allowed for authenticated clients; updates/deletes restricted
router.post('/', authMiddleware, createPedido)
router.put('/:id', authMiddleware, updatePedido)
router.delete('/:id', authMiddleware, requireAnyRole('admin', 'staff'), deletePedido)

// Staff endpoints to change estado and mesa
import { updatePedidoEstado, updatePedidoMesa } from '../controllers/pedidos.controller.js'
router.patch('/:id/estado', authMiddleware, requireAnyRole('staff', 'admin'), updatePedidoEstado)
router.patch('/:id/mesa', authMiddleware, requireAnyRole('staff', 'admin'), updatePedidoMesa)

export default router





