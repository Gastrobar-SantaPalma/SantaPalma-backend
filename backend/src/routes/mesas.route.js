import express from 'express'
import { 
    getMesas, 
    getMesaById,
    createMesa,
    updateMesa,
    deleteMesa
} from '../controllers/mesas.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'
const router = express.Router()

router.get('/', getMesas)
router.get('/:id', getMesaById)
// Protected write routes
router.post('/', authMiddleware, createMesa)
router.put('/:id', authMiddleware, updateMesa)
router.delete('/:id', authMiddleware, deleteMesa)

export default router
