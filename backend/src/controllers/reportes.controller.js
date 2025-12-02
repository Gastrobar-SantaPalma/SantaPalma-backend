import reportesService from '../services/reportes.service.js'

export const ventasTotal = async (req, res) => {
  try {
    const period = req.query.period || req.params.period || 'week'
    const result = await reportesService.ventasTotal(period)
    res.json(result)
  } catch (err) {
    console.error('ventasTotal error', err)
    res.status(500).json({ error: err.message })
  }
}

export const ingresosDias = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7
    const result = await reportesService.ingresosSeries(days)
    res.json(result.data ?? result)
  } catch (err) {
    console.error('ingresosDias error', err)
    res.status(500).json({ error: err.message })
  }
}

export const pedidosCountByDay = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7
    const result = await reportesService.pedidosCountByDay(days)
    res.json(result.data ?? result)
  } catch (err) {
    console.error('pedidosCountByDay error', err)
    res.status(500).json({ error: err.message })
  }
}

export const ordersByStatus = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7
    const result = await reportesService.ordersByStatus(days)
    res.json(result.data ?? result)
  } catch (err) {
    console.error('ordersByStatus error', err)
    res.status(500).json({ error: err.message })
  }
}

export const reviewsCountByDay = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7
    const result = await reportesService.reviewsCountByDay(days)
    res.json(result.data ?? result)
  } catch (err) {
    console.error('reviewsCountByDay error', err)
    res.status(500).json({ error: err.message })
  }
}

export const newClients = async (req, res) => {
  try {
    const days = Number(req.query.days) || 30
    const result = await reportesService.newClients(days)
    res.json(result)
  } catch (err) {
    console.error('newClients error', err)
    res.status(500).json({ error: err.message })
  }
}

export const topProducts = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10
    const result = await reportesService.topProducts(limit)
    res.json(result)
  } catch (err) {
    console.error('topProducts error', err)
    res.status(500).json({ error: err.message })
  }
}



export const topCategories = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 10
    const result = await reportesService.topCategories(limit)
    res.json(result)
  } catch (err) {
    console.error('topCategories error', err)
    res.status(500).json({ error: err.message })
  }
}

export const ventasPorMes = async (req, res) => {
  try {
    const y = Number(req.query.year || req.params.year)
    const m = Number(req.query.month || req.params.month)
    if (isNaN(y) || isNaN(m)) {
      return res.status(400).json({ error: 'year y month inválidos' })
    }
    const result = await reportesService.ventasPorMes(y, m)
    res.json(result.data ?? result)
  } catch (err) {
    console.error('ventasPorMes error', err)
    res.status(500).json({ error: err.message })
  }
}



