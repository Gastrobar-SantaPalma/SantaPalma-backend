import express from 'express'
import {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
} from '../controllers/productos.controller.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/', getProductos)
router.get('/:id', getProductoById)
// Protected write routes (admin only)
router.post('/', authMiddleware, requireRole('admin'), createProducto)
router.put('/:id', authMiddleware, requireRole('admin'), updateProducto)
router.delete('/:id', authMiddleware, requireRole('admin'), deleteProducto)

export default router
