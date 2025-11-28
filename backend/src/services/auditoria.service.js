import auditoriaRepository from '../repositories/auditoria.repository.js'

/**
 * Servicio para la lógica de negocio de Auditoría.
 */
class AuditoriaService {
  
  /**
   * Obtiene el historial de eventos de auditoría.
   * @param {Object} filters - Filtros de búsqueda.
   * @returns {Promise<Object>} Resultados paginados.
   */
  async getEventos(filters) {
    const { data, count, page, limit } = await auditoriaRepository.findAll(filters)
    const totalPages = Math.ceil((count || 0) / limit) || 0

    return {
      page,
      limit,
      total: count || 0,
      totalPages,
      events: data
    }
  }

  /**
   * Registra un evento manualmente (útil si no se usa trigger o para eventos personalizados).
   * @param {Object} data - Datos del evento.
   * @returns {Promise<Object>} El evento creado.
   */
  async logEvento(data) {
    if (!data.id_pedido) throw new Error('id_pedido es requerido para auditar')
    return await auditoriaRepository.create(data)
  }
}

export default new AuditoriaService()
