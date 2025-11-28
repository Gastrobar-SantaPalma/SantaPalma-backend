import mesaRepository from '../repositories/mesa.repository.js'

/**
 * Servicio para la lógica de negocio de Mesas.
 */
class MesaService {
  /**
   * Obtiene todas las mesas.
   * @returns {Promise<Array<Object>>} Lista de mesas.
   */
  async getMesas() {
    return await mesaRepository.findAll()
  }

  /**
   * Obtiene una mesa por ID.
   * @param {number} id - ID de la mesa.
   * @returns {Promise<Object>} La mesa encontrada.
   * @throws {Error} Si la mesa no existe.
   */
  async getMesaById(id) {
    const mesa = await mesaRepository.findById(id)
    if (!mesa) throw new Error('Mesa no encontrada')
    return mesa
  }

  /**
   * Crea una nueva mesa.
   * @param {Object} data - Datos de la mesa.
   * @returns {Promise<Object>} La mesa creada.
   */
  async createMesa(data) {
    // Limpiar campos no deseados (defensive programming)
    const { id_mesa, estado, ubicacion } = data
    
    const insertObj = {}
    if (estado !== undefined) insertObj.estado = estado
    if (ubicacion !== undefined) insertObj.ubicacion = ubicacion
    if (id_mesa !== undefined && id_mesa !== null) insertObj.id_mesa = Number(id_mesa)

    const nuevaMesa = await mesaRepository.create(insertObj)

    // Si se insertó un ID manual, sincronizar la secuencia
    if (id_mesa !== undefined && id_mesa !== null) {
      try {
        await mesaRepository.syncIdSequence()
      } catch (error) {
        console.error('Error calling sync_mesas_id_sequence:', error)
        // No fallamos la request si esto falla, solo logueamos
      }
    }

    return nuevaMesa
  }

  /**
   * Actualiza una mesa.
   * @param {number} id - ID de la mesa.
   * @param {Object} data - Datos a actualizar.
   * @returns {Promise<Object>} La mesa actualizada.
   * @throws {Error} Si la mesa no existe.
   */
  async updateMesa(id, data) {
    const { estado, ubicacion } = data

    // Verificar existencia
    const existingMesa = await mesaRepository.findById(id)
    if (!existingMesa) throw new Error('Mesa no encontrada')

    const updates = { estado, ubicacion }
    // Filtrar undefined
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key])

    return await mesaRepository.update(id, updates)
  }

  /**
   * Elimina una mesa.
   * @param {number} id - ID de la mesa.
   * @returns {Promise<void>}
   */
  async deleteMesa(id) {
    await mesaRepository.delete(id)
  }
}

export default new MesaService()
