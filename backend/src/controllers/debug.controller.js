import supabase from '../config/supabaseClient.js'

export const getPedidoDebug = async (req, res) => {
  const { id } = req.params
  try {
    const { data: byIdPedido, error: err1 } = await supabase
      .from('pedidos')
      .select('*')
      .eq('id_pedido', id)
      .maybeSingle()

    return res.status(200).json({ byIdPedido, err1: err1 ? err1.message : null })
  } catch (err) {
    console.error('Debug getPedido error:', err)
    return res.status(500).json({ error: 'Error interno (debug)' })
  }
}

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
    const r1 = await supabase
      .from('pedidos')
      .update({ estado })
      .eq('id_pedido', id)
      .select('*')
    // Also return the parsed body so we can see what the server received
    return res.status(200).json({ receivedBody: req.body || null, r1: { data: r1.data, error: r1.error ? r1.error.message : null } })
  } catch (err) {
    console.error('Debug updatePedido error:', err)
    return res.status(500).json({ error: 'Error interno (debug update)' })
  }
}

export default { getPedidoDebug, updatePedidoDebug }
