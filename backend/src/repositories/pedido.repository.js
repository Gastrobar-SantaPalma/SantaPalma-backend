import supabase from '../config/supabaseClient.js'

class PedidoRepository {
  async findAll({ page = 1, limit = 20, estado, id_mesa, id_cliente, from, to }) {
    const p = Math.max(parseInt(page, 10) || 1, 1)
    const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100)
    const start = (p - 1) * l
    const end = start + l - 1

    let query = supabase
      .from('pedidos')
      .select('id_pedido, id_cliente, id_mesa, estado, total, pago, fecha_pedido, items', { count: 'exact' })

    if (estado) query = query.eq('estado', estado)
    if (id_mesa) query = query.eq('id_mesa', id_mesa)
    if (id_cliente) query = query.eq('id_cliente', id_cliente)
    if (from) query = query.gte('fecha_pedido', from)
    if (to) query = query.lte('fecha_pedido', to)

    query = query.order('fecha_pedido', { ascending: false })

    const { data, count, error } = await query.range(start, end)

    if (error) throw new Error(error.message)

    return { data, count, page: p, limit: l }
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        id_pedido,
        id_cliente,
        id_mesa,
        estado,
        total,
        pago,
        fecha_pedido,
        items
      `)
      .eq('id_pedido', id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data
  }

  async findByClienteId(clienteId) {
    const { data, error } = await supabase
      .from('pedidos')
      .select('id_pedido, id_cliente, id_mesa, estado, total, pago, fecha_pedido, items')
      .eq('id_cliente', clienteId)
      .order('fecha_pedido', { ascending: false })

    if (error) throw new Error(error.message)
    return data
  }

  async create(pedidoData) {
    const { data, error } = await supabase
      .from('pedidos')
      .insert([pedidoData])
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from('pedidos')
      .update(updates)
      .eq('id_pedido', id)
      .select(`
        id_pedido,
        id_cliente,
        id_mesa,
        estado,
        total,
        pago,
        fecha_pedido,
        items
      `)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async delete(id) {
    const { error } = await supabase
      .from('pedidos')
      .delete()
      .eq('id_pedido', id)

    if (error) throw new Error(error.message)
    return true
  }
}

export default new PedidoRepository()
