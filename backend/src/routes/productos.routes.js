import express from 'express'
import {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
} from '../controllers/productos.controller.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'
import upload from '../middlewares/upload.middleware.js'

const router = express.Router()

// Catalog endpoint: require authenticated user according to HU1.1
router.get('/', authMiddleware, getProductos)
router.get('/:id', getProductoById)
// Protected write routes (admin only)
// Accept multipart/form-data with field `image` for product image upload
router.post('/', authMiddleware, requireRole('admin'), upload.single('image'), createProducto)
router.put('/:id', authMiddleware, requireRole('admin'), upload.single('image'), updateProducto)
router.delete('/:id', authMiddleware, requireRole('admin'), deleteProducto)

export default router
