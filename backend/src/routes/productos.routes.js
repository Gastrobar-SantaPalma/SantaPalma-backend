import express from 'express'
import {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
} from '../controllers/productos.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/', getProductos)
router.get('/:id', getProductoById)
// Protected write routes (admin)
router.post('/', authMiddleware, createProducto)
router.put('/:id', authMiddleware, updateProducto)
router.delete('/:id', authMiddleware, deleteProducto)

export default router
