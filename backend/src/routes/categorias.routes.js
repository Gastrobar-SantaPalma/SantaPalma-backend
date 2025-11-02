import express from 'express'
import {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria
} from '../controllers/categorias.controller.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/', getCategorias)
router.get('/:id', getCategoriaById)

// protected write routes (admin only)
router.post('/', authMiddleware, requireRole('admin'), createCategoria)
router.put('/:id', authMiddleware, requireRole('admin'), updateCategoria)
router.delete('/:id', authMiddleware, requireRole('admin'), deleteCategoria)

export default router
