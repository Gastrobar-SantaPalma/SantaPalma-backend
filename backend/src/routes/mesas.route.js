import express from 'express'
import { 
    getMesas, 
    getMesaById,
    createMesa,
    updateMesa,
    deleteMesa
} from '../controllers/mesas.controller.js'
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js'
import { generateQr } from '../controllers/qr.controller.js'
const router = express.Router()

router.get('/', getMesas)
router.get('/:id', getMesaById)
// Protected write routes
router.post('/', authMiddleware, createMesa)
router.put('/:id', authMiddleware, updateMesa)
router.delete('/:id', authMiddleware, deleteMesa)

// Admin: generate QR for a mesa (PNG by default, PDF if ?format=pdf)
router.post('/:id/generate-qr', authMiddleware, requireRole('admin'), generateQr)

export default router
