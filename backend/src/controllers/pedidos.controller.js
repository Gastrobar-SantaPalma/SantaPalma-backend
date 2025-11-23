import pedidoService from '../services/pedido.service.js'

// Obtener todos los pedidos
export const getPedidos = async (req, res) => {
  try {
    const { page, limit, estado, id_mesa, id_cliente, from, to } = req.query
    const result = await pedidoService.getPedidos({ page, limit, estado, id_mesa, id_cliente, from, to })
    res.status(200).json(result)
  } catch (err) {
    console.error('Error en getPedidos:', err)
    res.status(500).json({ error: err.message || 'Error interno' })
  }
}

// Obtener un pedido por ID
export const getPedidoById = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pedidoService.getPedidoById(id)
    res.status(200).json(result)
  } catch (err) {
    console.error('Error en getPedidoById:', err)
    if (err.message === 'Pedido no encontrado') {
      return res.status(404).json({ error: err.message })
    }
    res.status(500).json({ error: err.message || 'Error interno' })
  }
}

// Obtener pedidos del cliente autenticado
export const getPedidosDelCliente = async (req, res) => {
  try {
    const clienteId = req.user.id
    const pedidos = await pedidoService.getPedidosByCliente(clienteId)
    res.json({ pedidos })
  } catch (err) {
    console.error('Error en getPedidosDelCliente:', err)
    res.status(500).json({ error: err.message || 'Error interno' })
  }
}

// Crear un nuevo pedido
export const createPedido = async (req, res) => {
  try {
    const newPedido = await pedidoService.createPedido(req.body)
    res.status(201).json(newPedido)
  } catch (err) {
    console.error('Error al crear pedido:', err)
    // Simple heuristic to distinguish bad request from server error
    if (err.message.includes('requerido') || err.message.includes('inválido') || err.message.includes('no existe') || err.message.includes('no encontrado')) {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: err.message || 'Error interno' })
  }
}

// Actualizar un pedido existente
export const updatePedido = async (req, res) => {
  const { id } = req.params
  try {
    const updatedPedido = await pedidoService.updatePedido(id, req.body)
    res.status(200).json(updatedPedido)
  } catch (err) {
    console.error('Error al actualizar pedido:', err)
    if (err.message === 'Pedido no encontrado') {
      return res.status(404).json({ error: err.message })
    }
    if (err.message.includes('requerido') || err.message.includes('inválido') || err.message.includes('no existe')) {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: err.message || 'Error interno' })
  }
}

// Patch estado (staff/admin)
export const updatePedidoEstado = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pedidoService.updatePedidoEstado(id, req.body.estado)
    res.status(200).json(result.pedido || result)
  } catch (err) {
    console.error('Error en updatePedidoEstado:', err)
    if (err.message === 'Pedido no encontrado') {
      return res.status(404).json({ error: err.message })
    }
    if (err.message.includes('requerido') || err.message.includes('no válido') || err.message.includes('Transición inválida')) {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: err.message || 'Error interno' })
  }
}

// Patch mesa (staff/admin)
export const updatePedidoMesa = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pedidoService.updatePedidoMesa(id, req.body.id_mesa)
    res.status(200).json(result)
  } catch (err) {
    console.error('Error en updatePedidoMesa:', err)
    if (err.message === 'Mesa no encontrada') {
      return res.status(400).json({ error: err.message })
    }
    if (err.message.includes('requerido')) {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: err.message || 'Error interno' })
  }
}

// Actualizar estado de pago del pedido (staff/admin)
export const updatePedidoPago = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pedidoService.updatePedidoPago(id, req.body.pago)
    res.status(200).json(result)
  } catch (err) {
    console.error('Error en updatePedidoPago:', err)
    if (err.message === 'Pedido no encontrado') {
      return res.status(404).json({ error: err.message })
    }
    if (err.message.includes('requerido') || err.message.includes('no válido')) {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: err.message || 'Error interno' })
  }
}

// Eliminar pedido
export const deletePedido = async (req, res) => {
  const { id } = req.params
  try {
    await pedidoService.deletePedido(id)
    res.status(204).send()
  } catch (err) {
    console.error('Error al eliminar pedido:', err)
    res.status(400).json({ error: err.message })
  }
}


