import auditoriaService from '../services/auditoria.service.js'

// GET /api/auditoria
export const getEventos = async (req, res) => {
  try {
    const { page, limit, id_pedido, from, to } = req.query
    const result = await auditoriaService.getEventos({ page, limit, id_pedido, from, to })
    res.status(200).json(result)
  } catch (err) {
    console.error('Error obteniendo auditoría:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}
