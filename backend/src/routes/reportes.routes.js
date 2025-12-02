import { Router } from 'express'
import {
  ventasTotal,
  ingresosDias,
  pedidosCountByDay,
  ordersByStatus,
  reviewsCountByDay,
  newClients,
  topProducts,
  topCategories,
  ventasPorMes
} from '../controllers/reportes.controller.js'

const router = Router()

// --- VENTAS ---
router.get('/ventas/total', ventasTotal)
router.get('/ventas/semana', (req, res) => { req.query.period = 'week'; return ventasTotal(req, res) })
router.get('/ventas/mes', (req, res) => { req.query.period = 'month'; return ventasTotal(req, res) })
router.get('/ventas/anio', (req, res) => { req.query.period = 'year'; return ventasTotal(req, res) })

router.get('/ventas/ingresos/dia', ingresosDias)
router.get('/ventas/ingresos/semana', ingresosDias)

// Ventas por mes (para gráficos mensuales)
router.get('/ventas/por-mes', ventasPorMes)

// --- PEDIDOS ---
router.get('/pedidos/count-by-day', pedidosCountByDay)
router.get('/pedidos/status-by', ordersByStatus)

// --- RESEÑAS / REVIEWS ---
router.get('/reseñas/dia', reviewsCountByDay)
router.get('/reviews/daily', reviewsCountByDay)

// --- CLIENTES ---
router.get('/clientes/nuevos', newClients)

// --- TOP ---
router.get('/categorias/top', categoriasController.topCategories)
router.get('/categorias/:id', categoriasController.getCategoriaById)


export default router
