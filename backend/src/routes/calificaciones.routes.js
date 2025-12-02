import { Router } from 'express'
import { crearCalificacion, obtenerCalificaciones } from '../controllers/calificaciones.controller.js'

const router = Router()

router.post('/', crearCalificacion)
router.get('/:id_producto', obtenerCalificaciones)

export default router
