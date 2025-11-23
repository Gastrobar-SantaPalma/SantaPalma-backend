import supabase from '../config/supabaseClient.js'

/**
 * Repositorio para la entidad Auditoria (pedido_eventos).
 */
class AuditoriaRepository {
  
  /**
   * Obtiene eventos de auditoría con filtros y paginación.
   * @param {Object} filters - Filtros (page, limit, id_pedido, from, to).
   * @returns {Promise<Object>} Datos y conteo total.
   */
  async findAll({ page = 1, limit = 20, id_pedido, from, to }) {
    const p = Math.max(parseInt(page, 10) || 1, 1)
    const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100)
    const start = (p - 1) * l
    const end = start + l - 1

    let query = supabase
      .from('pedido_eventos')
      .select('*', { count: 'exact' })

    if (id_pedido) query = query.eq('id_pedido', id_pedido)
    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', to)

    query = query.order('created_at', { ascending: false })

    const { data, count, error } = await query.range(start, end)

    if (error) throw new Error(error.message)

    return { data, count, page: p, limit: l }
  }

  /**
   * Crea un nuevo evento de auditoría.
   * @param {Object} data - Datos del evento.
   * @returns {Promise<Object>} El evento creado.
   */
  async create(data) {
    const { data: event, error } = await supabase
      .from('pedido_eventos')
      .insert([data])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return event
  }
}

export default new AuditoriaRepository()
