import pedidoService from '../services/pedido.service.js'

/**
 * Obtiene un pedido para depuración.
 * 
 * @param {import('express').Request} req - Objeto de solicitud Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>}
 */
export const getPedidoDebug = async (req, res) => {
  const { id } = req.params
  try {
    const { pedido } = await pedidoService.getPedidoById(id)
    return res.status(200).json({ byIdPedido: pedido, err1: null })
  } catch (err) {
    console.error('Debug getPedido error:', err)
    if (err.message === 'Pedido no encontrado') {
      return res.status(404).json({ error: err.message })
    }
    return res.status(500).json({ error: 'Error interno (debug)' })
  }
}

/**
 * Actualiza el estado de un pedido para depuración.
 * 
 * @param {import('express').Request} req - Objeto de solicitud Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>}
 */
export const updatePedidoDebug = async (req, res) => {
  const { id } = req.params
  try {
    console.log('[debug] updatePedidoDebug typeof req.body:', typeof req.body)
    console.log('[debug] updatePedidoDebug req.body keys:', Object.keys(req.body || {}))
    console.log('[debug] updatePedidoDebug req.body JSON:', JSON.stringify(req.body))
  } catch (e) {
    console.log('[debug] updatePedidoDebug logging failed', e)
  }
  const { estado } = req.body || {}
  if (!estado) return res.status(400).json({ error: 'estado es requerido' })

  try {
    const updated = await pedidoService.updatePedidoEstado(id, estado)
    // Also return the parsed body so we can see what the server received
    return res.status(200).json({ receivedBody: req.body || null, r1: { data: [updated], error: null } })
  } catch (err) {
    console.error('Debug updatePedido error:', err)
    return res.status(500).json({ error: 'Error interno (debug update)' })
  }
}

export default { getPedidoDebug, updatePedidoDebug }
