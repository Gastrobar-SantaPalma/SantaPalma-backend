import mesaService from '../services/mesa.service.js'

/**
 * Controlador para gestionar las mesas.
 */
export const getMesas = async (req, res) => {
  try {
    const mesas = await mesaService.getMesas()
    res.json(mesas)
  } catch (error) {
    console.error('Error al obtener mesas:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const getMesaById = async (req, res) => {
  const { id } = req.params
  try {
    const mesa = await mesaService.getMesaById(id)
    res.json(mesa)
  } catch (error) {
    console.error('Error al obtener mesa:', error)
    if (error.message === 'Mesa no encontrada') {
      return res.status(404).json({ error: error.message })
    }
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const createMesa = async (req, res) => {
  try {
    const nuevaMesa = await mesaService.createMesa(req.body)
    res.status(201).json(nuevaMesa)
  } catch (error) {
    console.error('Error al crear mesa:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const updateMesa = async (req, res) => {
  const { id } = req.params
  try {
    const mesaActualizada = await mesaService.updateMesa(id, req.body)
    res.json(mesaActualizada)
  } catch (error) {
    console.error('Error al actualizar mesa:', error)
    if (error.message === 'Mesa no encontrada') {
      return res.status(404).json({ error: error.message })
    }
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const deleteMesa = async (req, res) => {
  const { id } = req.params
  try {
    await mesaService.deleteMesa(id)
    res.status(204).send()
  } catch (error) {
    console.error('Error al eliminar mesa:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
