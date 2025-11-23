import express from 'express'
import {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  rateProduct,
  getProductComments
} from '../controllers/productos.controller.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'
import upload from '../middlewares/upload.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import { createProductoSchema, updateProductoSchema, rateProductSchema } from '../schemas/producto.schema.js'

const router = express.Router()

// Catalog endpoint: require authenticated user according to HU1.1
router.get('/', authMiddleware, getProductos)
router.get('/:id', getProductoById)

// Rating endpoints
router.post('/:id/calificacion', authMiddleware, validate(rateProductSchema), rateProduct)
router.get('/:id/comentarios', getProductComments)

// Protected write routes (admin only)
// Accept multipart/form-data with field `image` for product image upload
// Note: Validation middleware is placed AFTER upload middleware because req.body is populated by multer
router.post('/', authMiddleware, requireRole('admin'), upload.single('image'), validate(createProductoSchema), createProducto)
router.put('/:id', authMiddleware, requireRole('admin'), upload.single('image'), validate(updateProductoSchema), updateProducto)
router.delete('/:id', authMiddleware, requireRole('admin'), deleteProducto)

export default router
