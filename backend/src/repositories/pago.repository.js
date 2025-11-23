import supabase from '../config/supabaseClient.js'

/**
 * Repositorio para la entidad Pagos.
 */
class PagoRepository {
  
  /**
   * Crea un registro de pago.
   * @param {Object} data - Datos del pago.
   * @returns {Promise<Object>} El pago creado.
   */
  async create(data) {
    const { data: pago, error } = await supabase
      .from('pagos')
      .insert([data])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return pago
  }

  /**
   * Busca un pago por ID de transacción.
   * @param {string} transactionId - ID de transacción de la pasarela.
   * @returns {Promise<Object|null>} El pago encontrado.
   */
  async findByTransactionId(transactionId) {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('transaction_id', transactionId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Busca el último pago asociado a un pedido.
   * @param {number} pedidoId - ID del pedido.
   * @returns {Promise<Object|null>} El pago encontrado.
   */
  async findLastByPedidoId(pedidoId) {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('id_pedido', pedidoId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Actualiza un pago por ID.
   * @param {number} id - ID del pago.
   * @param {Object} updates - Datos a actualizar.
   * @returns {Promise<Object>} El pago actualizado.
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('pagos')
      .update(updates)
      .eq('id_pago', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }
}

export default new PagoRepository()
