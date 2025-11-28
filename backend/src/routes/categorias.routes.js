import { Router } from 'express'
import {
  getCategorias,
  getCategoriaById,
  createCategoria,
  updateCategoria,
  deleteCategoria
} from '../controllers/categorias.controller.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'
import { validate } from '../middlewares/validate.middleware.js'
import { createCategoriaSchema, updateCategoriaSchema } from '../schemas/categoria.schema.js'

const router = Router()

/**
 * @route GET /api/categorias
 * @desc Obtener todas las categorías
 * @access Public
 */
router.get('/', getCategorias)

/**
 * @route GET /api/categorias/:id
 * @desc Obtener una categoría por ID
 * @access Public
 */
router.get('/:id', getCategoriaById)

/**
 * @route POST /api/categorias
 * @desc Crear una nueva categoría
 * @access Private (Admin)
 */
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  validate(createCategoriaSchema),
  createCategoria
)

/**
 * @route PUT /api/categorias/:id
 * @desc Actualizar una categoría existente
 * @access Private (Admin)
 */
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  validate(updateCategoriaSchema),
  updateCategoria
)

/**
 * @route DELETE /api/categorias/:id
 * @desc Eliminar una categoría
 * @access Private (Admin)
 */
router.delete(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  deleteCategoria
)

export default router
