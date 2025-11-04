import supabase from '../config/supabaseClient.js'
import { calcularTotal } from '../utils/calculateTotal.js'
import { logPedidoEvent } from '../services/pedidoEvents.service.js'

// Normalize estado strings coming from the client to canonical tokens used in DB
const normalizeEstado = (input) => {
  if (input === undefined || input === null) return input

  // Normalize to NFD and strip combining diacritical marks, collapse spaces and trim
  const s = String(input)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  // common synonyms mapping
  const map = {
    'en preparacion': 'preparando',
    'en preparacion ': 'preparando',
    'en preparacion': 'preparando',
    'preparacion': 'preparando',
    'preparación': 'preparando',
    'en preparaci n': 'preparando',
    'pendiente': 'pendiente',
    'preparando': 'preparando',
    'listo': 'listo',
    'entregado': 'entregado',
    'cancelado': 'cancelado'
  }

  if (map[s]) return map[s]

  // fallback: remove spaces
  return s.replace(/\s+/g, '')
}

// Obtener todos los pedidos
export const getPedidos = async (req, res) => {
  try {
    const { page = 1, limit = 20, estado, id_mesa, id_cliente, from, to } = req.query
    const p = Math.max(parseInt(page, 10) || 1, 1)
    const l = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100)
    const start = (p - 1) * l
    const end = start + l - 1

    let query = supabase
      .from('pedidos')
      // Note: some DB schemas may not include an `updated_at` column. Avoid selecting it to prevent errors.
      .select('id_pedido, id_cliente, id_mesa, estado, total, fecha_pedido, items', { count: 'exact' })

    if (estado) query = query.eq('estado', estado)
    if (id_mesa) query = query.eq('id_mesa', id_mesa)
    if (id_cliente) query = query.eq('id_cliente', id_cliente)
    if (from) query = query.gte('fecha_pedido', from)
    if (to) query = query.lte('fecha_pedido', to)

    query = query.order('fecha_pedido', { ascending: false })

    const { data, count, error } = await query.range(start, end)
    if (error) {
      console.error('Error al obtener pedidos:', error.message)
      return res.status(500).json({ error: error.message })
    }

    const total = count || 0
    const totalPages = Math.ceil(total / l) || 0
    res.status(200).json({ page: p, limit: l, total, totalPages, pedidos: data })
  } catch (err) {
    console.error('Error en getPedidos:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Patch estado (staff/admin)
export const updatePedidoEstado = async (req, res) => {
  // Start fresh: only accept nuevo estado via JSON body. Route is protected by
  // `requireAnyRole('staff','admin')` at the router level so callers must be staff/admin.
  const { id } = req.params

  // Quick debug: log headers and body to verify payload parsing
  try { console.debug('[pedidos] headers:', req.headers) } catch (e) {}
  try { console.debug('[pedidos] body:', req.body) } catch (e) {}

  // 1) Extract and normalize new estado from body
  const rawEstado = req.body && req.body.estado
  const nuevoEstado = normalizeEstado(rawEstado)
  // Extra debug to diagnose empty/invalid normalization cases
  try {
    console.debug('[pedidos] rawEstado type/val:', typeof rawEstado, JSON.stringify(rawEstado))
    console.debug('[pedidos] nuevoEstado type/val:', typeof nuevoEstado, JSON.stringify(nuevoEstado))
  } catch (e) {}
  if (!nuevoEstado) return res.status(400).json({ error: 'estado es requerido en el body' })

  // 2) Allowed DB enum values (mirror of DB): pendiente, preparando, listo, entregado, cancelado
  const allowedStates = ['pendiente', 'preparando', 'listo', 'entregado', 'cancelado']
  if (!allowedStates.includes(nuevoEstado)) return res.status(400).json({ error: `estado no válido: ${nuevoEstado}` })

  // 3) Optional: enforce sensible transitions
  const transitions = {
    pendiente: ['preparando', 'cancelado'],
    preparando: ['listo', 'cancelado'],
    listo: ['entregado'],
    entregado: [],
    cancelado: []
  }

  try {
    // Fetch pedido by id_pedido only
    const { data: pedido, error: pedidoErr } = await supabase
      .from('pedidos')
      .select('id_pedido, estado')
      .eq('id_pedido', id)
      .maybeSingle()

    if (pedidoErr) return res.status(500).json({ error: 'Error interno al leer pedido' })
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })

    const estadoActual = pedido.estado
  console.debug('[pedidos] estadoActual:', estadoActual, 'nuevoEstado:', nuevoEstado)
    if (estadoActual === nuevoEstado) return res.status(200).json({ message: 'Estado sin cambios', pedido })

    const allowed = transitions[estadoActual] || []
    if (!allowed.includes(nuevoEstado)) {
      return res.status(400).json({ error: `Transición inválida de ${estadoActual} a ${nuevoEstado}` })
    }

    // Perform update
    const { data: updated, error: updateErr } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id_pedido', id)
      .select('*')

    if (updateErr) {
      console.error('Supabase update error:', updateErr)
      return res.status(400).json({ error: updateErr.message })
    }

    // Log event (best-effort)
    try {
      await logPedidoEvent({ id_pedido: id, from: estadoActual, to: nuevoEstado, description: `Cambio de estado ${estadoActual} → ${nuevoEstado}` })
    } catch (e) {
      // ignore logging errors
    }

    return res.status(200).json(updated && updated[0] ? updated[0] : null)
  } catch (err) {
    console.error('Error en updatePedidoEstado:', err)
    return res.status(500).json({ error: 'Error interno' })
  }
}

// Patch mesa (staff/admin)
export const updatePedidoMesa = async (req, res) => {
  const { id } = req.params
  let { id_mesa } = req.body

  if (!id_mesa) return res.status(400).json({ error: 'id_mesa es requerido' })

  try {
    // verify mesa exists
    const { data: mesa, error: mesaErr } = await supabase
      .from('mesas')
      .select('id_mesa')
      .eq('id_mesa', id_mesa)
      .maybeSingle()

    if (mesaErr) return res.status(500).json({ error: 'Error interno verificando mesa' })
    if (!mesa) return res.status(400).json({ error: 'Mesa no encontrada' })

    const { data, error } = await supabase
      .from('pedidos')
      .update({ id_mesa })
      .eq('id_pedido', id)
      .select('*')

    if (error) return res.status(400).json({ error: error.message })

    // Log event
    try { await logPedidoEvent({ id_pedido: id, from: null, to: null, description: `Cambio de mesa a ${id_mesa}` }) } catch (e) {}

    res.status(200).json(data[0])
  } catch (err) {
    console.error('Error en updatePedidoMesa:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Obtener un pedido por ID
export const getPedidoById = async (req, res) => {
  const { id } = req.params
  try {
    // Fetch main pedido row including items and timestamps
    const { data: pedido, error: pedidoErr } = await supabase
      .from('pedidos')
      .select(`
        id_pedido,
        id_cliente,
        id_mesa,
        estado,
        total,
        fecha_pedido,
        items
      `)
      .eq('id_pedido', id)
      .maybeSingle()

    if (pedidoErr) {
      console.error('Error al obtener pedido:', pedidoErr.message)
      return res.status(500).json({ error: 'Error interno' })
    }

    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })

  // Try to fetch recent events from common audit/history tables if they exist
    const historyCandidates = ['pedido_eventos', 'pedidos_historial', 'pedido_historial', 'auditoria']
    let events = []

    for (const table of historyCandidates) {
      try {
        const { data: evs, error: evErr } = await supabase
          .from(table)
          .select('id, id_pedido, descripcion, estado_anterior, estado_nuevo, created_at')
          // event tables refer to id_pedido; use the pedidoColumn if needed
          .eq('id_pedido', id)
          .order('created_at', { ascending: false })
          .limit(5)

        if (evErr) {
          // table might not exist or permission denied; try next candidate
          continue
        }

        if (evs && evs.length > 0) {
          events = evs.map(e => ({
            id: e.id || null,
            description: e.descripcion || (e.estado_anterior ? `Cambio ${e.estado_anterior} → ${e.estado_nuevo}` : undefined),
            from: e.estado_anterior || null,
            to: e.estado_nuevo || null,
            at: e.created_at || null
          }))
          break
        }
      } catch (errTable) {
        // ignore and continue
        continue
      }
    }

    // Fallback: if no events found, create a minimal history from pedido timestamps
    if (events.length === 0) {
      events = [{
        id: null,
        description: 'Pedido creado',
        from: null,
        to: pedido.estado || null,
        at: pedido.fecha_pedido || pedido.updated_at || null
      }]
    }

    res.status(200).json({ pedido, history: events })
  } catch (err) {
    console.error('Error en getPedidoById:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Crear un nuevo pedido
export const createPedido = async (req, res) => {
  try {
  let { id_cliente, id_mesa, items, total } = req.body

    // Basic validations
    if (!id_cliente && !id_mesa) return res.status(400).json({ error: 'id_cliente o id_mesa es requerido' })
    if (!items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items debe ser un arreglo con al menos un elemento' })

    // Verify foreign keys exist to avoid DB FK constraint errors
    if (id_cliente) {
      const { data: cliente, error: clienteErr } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('id_usuario', id_cliente)
        .maybeSingle()

      if (clienteErr) {
        console.error('Error comprobando id_cliente:', clienteErr.message)
        return res.status(500).json({ error: 'Error interno verificando id_cliente' })
      }
      if (!cliente) return res.status(400).json({ error: 'id_cliente no existe' })
    }

    if (id_mesa) {
      // Try to find mesa by id_mesa. Accept numeric strings too.
      let mesa = null
      try {
        const maybeId = Number(id_mesa)
        if (!Number.isNaN(maybeId)) {
          const { data, error: mesaErr } = await supabase
            .from('mesas')
            .select('id_mesa')
            .eq('id_mesa', maybeId)
            .maybeSingle()
          if (mesaErr) {
            console.error('Error comprobando id_mesa (num):', mesaErr.message)
            return res.status(500).json({ error: 'Error interno verificando id_mesa' })
          }
          mesa = data
        }

        // If not found by numeric id, try matching against codigo_qr (useful when frontend sends QR code)
        if (!mesa) {
          const { data: byQr, error: qrErr } = await supabase
            .from('mesas')
            .select('id_mesa, codigo_qr')
            .eq('codigo_qr', String(id_mesa))
            .maybeSingle()
          if (qrErr) {
            console.error('Error comprobando codigo_qr de mesa:', qrErr.message)
            return res.status(500).json({ error: 'Error interno verificando id_mesa' })
          }
          mesa = byQr
        }
      } catch (errMesa) {
        console.error('Error verificando mesa:', errMesa)
        return res.status(500).json({ error: 'Error interno verificando id_mesa' })
      }

      if (!mesa) return res.status(400).json({ error: 'Mesa no encontrada (id_mesa o codigo_qr inválido)' })

      // If mesa was found by codigo_qr, normalize id_mesa to the real id for insertion
      if (mesa && mesa.id_mesa) id_mesa = mesa.id_mesa
    }

    // Validate items shape. Prices are derived from productos table server-side.
    for (const it of items) {
      if (!it.id_producto) return res.status(400).json({ error: 'cada item debe tener id_producto' })
      if (it.cantidad === undefined || it.cantidad === null) return res.status(400).json({ error: 'cada item debe tener cantidad' })

      const cantidadNum = Number(it.cantidad)
      if (Number.isNaN(cantidadNum) || cantidadNum <= 0) return res.status(400).json({ error: 'cantidad inválida en un item' })

      // normalize cantidad only for now; precio/subtotal will be set below after fetching product prices
      it.cantidad = cantidadNum
    }

    // Fetch product prices in bulk to ensure server-side authoritative pricing
    const productIds = [...new Set(items.map(i => i.id_producto))]
    const { data: products, error: prodErr } = await supabase
      .from('productos')
      .select('id_producto, precio, disponible')
      .in('id_producto', productIds)

    if (prodErr) {
      console.error('Error obteniendo productos para calcular precios:', prodErr.message)
      return res.status(500).json({ error: 'Error interno obteniendo precios de productos' })
    }

    // Build a map of id_producto -> precio
    const priceMap = new Map()
    for (const p of products || []) {
      priceMap.set(p.id_producto, Number(p.precio))
    }

    // Ensure all referenced products exist and are available
    for (const it of items) {
      if (!priceMap.has(it.id_producto)) return res.status(400).json({ error: `Producto no encontrado: ${it.id_producto}` })
      const precioNum = priceMap.get(it.id_producto)
      if (precioNum === undefined || precioNum === null || Number.isNaN(precioNum)) return res.status(500).json({ error: `Precio inválido para producto ${it.id_producto}` })

      // set authoritative price and subtotal
      it.precio = precioNum
      it.subtotal = Number((precioNum * it.cantidad).toFixed(2))
    }

    const expectedTotal = calcularTotal(items)
    if (total !== undefined && total !== null) {
      const totalNum = Number(total)
      if (Number.isNaN(totalNum) || Math.abs(totalNum - expectedTotal) > 0.01) {
        return res.status(400).json({ error: `Total inválido. Esperado: ${expectedTotal}` })
      }
    }

    const pedidoObj = {
      id_cliente: id_cliente || null,
      id_mesa: id_mesa || null,
      items,
      total: expectedTotal,
      estado: 'pendiente',
      fecha_pedido: new Date().toISOString()
    }

    // Insert and expect DB to support items json/jsonb column. If not, return an instructive error.
    const { data, error } = await supabase
      .from('pedidos')
      .insert([pedidoObj])
      .select()

    if (error) {
      console.error('Error al crear pedido:', error.message)
      if (error.message && error.message.includes("Could not find the 'items' column")) {
        return res.status(500).json({ error: "La tabla 'pedidos' no tiene la columna 'items'. Ejecuta ALTER TABLE pedidos ADD COLUMN items jsonb; en la base de datos." })
      }
      return res.status(400).json({ error: error.message })
    }

    // Log event (best-effort)
    try {
      const newPedido = data[0]
      await logPedidoEvent({ id_pedido: newPedido.id_pedido || newPedido.id, from: null, to: newPedido.estado || 'pendiente', description: 'Pedido creado' })
    } catch (errLog) {
      // already handled inside service; ignore
    }

    res.status(201).json(data[0])
  } catch (err) {
    console.error('Error interno al crear pedido:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Actualizar un pedido existente
export const updatePedido = async (req, res) => {
  const { id } = req.params
  try {
  // guard against missing req.body (avoid destructure TypeError)
  let { id_cliente, id_mesa, estado, total, items } = req.body || {}

  // normalize estado if provided (accept values like "en preparación")
  if (estado !== undefined && estado !== null) estado = normalizeEstado(estado)

    // Fetch current pedido to detect estado changes (look up by id_pedido only)
    const { data: existingPedido, error: existingErr } = await supabase
      .from('pedidos')
      .select('id_pedido, estado')
      .eq('id_pedido', id)
      .maybeSingle()

    if (existingErr) {
      console.error('Error obteniendo pedido previo:', existingErr.message)
      return res.status(500).json({ error: 'Error interno' })
    }

    // If the pedido doesn't exist, return 404 early (avoid doing work)
    if (!existingPedido) return res.status(404).json({ error: 'Pedido no encontrado' })

    const previousEstado = existingPedido ? existingPedido.estado : null

    // If items provided, validate them and derive prices server-side (same approach as create)
    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items debe ser un arreglo con al menos un elemento' })

      // normalize cantidad and validate presence
      for (const it of items) {
        if (!it.id_producto) return res.status(400).json({ error: 'cada item debe tener id_producto' })
        if (it.cantidad === undefined || it.cantidad === null) return res.status(400).json({ error: 'cada item debe tener cantidad' })

        const cantidadNum = Number(it.cantidad)
        if (Number.isNaN(cantidadNum) || cantidadNum <= 0) return res.status(400).json({ error: 'cantidad inválida en un item' })
        it.cantidad = cantidadNum
      }

      // Fetch product prices in bulk
      const productIdsUpd = [...new Set(items.map(i => i.id_producto))]
      const { data: productsUpd, error: prodErrUpd } = await supabase
        .from('productos')
        .select('id_producto, precio, disponible')
        .in('id_producto', productIdsUpd)

      if (prodErrUpd) {
        console.error('Error obteniendo productos para calcular precios (update):', prodErrUpd.message)
        return res.status(500).json({ error: 'Error interno obteniendo precios de productos' })
      }

      const priceMapUpd = new Map()
      for (const p of productsUpd || []) priceMapUpd.set(p.id_producto, Number(p.precio))

      for (const it of items) {
        if (!priceMapUpd.has(it.id_producto)) return res.status(400).json({ error: `Producto no encontrado: ${it.id_producto}` })
        const precioNum = priceMapUpd.get(it.id_producto)
        if (precioNum === undefined || precioNum === null || Number.isNaN(precioNum)) return res.status(500).json({ error: `Precio inválido para producto ${it.id_producto}` })

        it.precio = precioNum
        it.subtotal = Number((precioNum * it.cantidad).toFixed(2))
      }

      const expectedTotal = calcularTotal(items)
      if (total !== undefined && total !== null) {
        const totalNum = Number(total)
        if (Number.isNaN(totalNum) || Math.abs(totalNum - expectedTotal) > 0.01) {
          return res.status(400).json({ error: `Total inválido. Esperado: ${expectedTotal}` })
        }
      }
      // If client didn't send total, set it server-side
      total = expectedTotal
    }

    // Verify FK targets if provided
    if (id_cliente) {
      const { data: cliente, error: clienteErr } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('id_usuario', id_cliente)
        .maybeSingle()
      if (clienteErr) return res.status(500).json({ error: 'Error interno verificando id_cliente' })
      if (!cliente) return res.status(400).json({ error: 'id_cliente no existe' })
    }
    if (id_mesa) {
      // Same normalization as in create: accept numeric ids or codigo_qr and resolve to actual id_mesa
      let mesa = null
      try {
        const maybeId = Number(id_mesa)
        if (!Number.isNaN(maybeId)) {
          const { data, error: mesaErr } = await supabase
            .from('mesas')
            .select('id_mesa')
            .eq('id_mesa', maybeId)
            .maybeSingle()
          if (mesaErr) return res.status(500).json({ error: 'Error interno verificando id_mesa' })
          mesa = data
        }

        if (!mesa) {
          const { data: byQr, error: qrErr } = await supabase
            .from('mesas')
            .select('id_mesa, codigo_qr')
            .eq('codigo_qr', String(id_mesa))
            .maybeSingle()
          if (qrErr) return res.status(500).json({ error: 'Error interno verificando id_mesa' })
          mesa = byQr
        }
      } catch (errMesa) {
        console.error('Error comprobando mesa:', errMesa)
        return res.status(500).json({ error: 'Error interno verificando id_mesa' })
      }

      if (!mesa) return res.status(400).json({ error: 'Mesa no encontrada (id_mesa o codigo_qr inválido)' })
      if (mesa && mesa.id_mesa) id_mesa = mesa.id_mesa
    }

    // Build updates only with defined fields to avoid accidental null/undefined writes
  const updates = {}
  if (id_cliente !== undefined) updates.id_cliente = id_cliente
  if (id_mesa !== undefined) updates.id_mesa = id_mesa
  if (estado !== undefined) updates.estado = estado
  if (total !== undefined) updates.total = total
  if (items !== undefined) updates.items = items

    // Update by id_pedido only
    const pkColUpd = 'id_pedido'
    console.debug('[pedidos] updatePedido attempt', { id, pkColUpd, updates })

    let { data, error } = await supabase
      .from('pedidos')
      .update(updates)
      .eq('id_pedido', id)
      .select(`
        id_pedido,
        id_cliente,
        id_mesa,
        estado,
        total,
        fecha_pedido,
        items
      `)

    console.debug('[pedidos] updatePedido result', { id, pkColUpd, data, error })

    if (error) {
      console.error('Error al actualizar pedido:', error.message)
      if (error.message && error.message.includes("Could not find the 'items' column")) {
        return res.status(500).json({ error: "La tabla 'pedidos' no tiene la columna 'items'. Ejecuta ALTER TABLE pedidos ADD COLUMN items jsonb; en la base de datos." })
      }
      return res.status(400).json({ error: error.message })
    }

    if (!data || data.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' })

    // If estado changed, log event (best-effort)
    try {
      const updated = data[0]
      const newEstado = updated.estado
      if (previousEstado !== null && newEstado && previousEstado !== newEstado) {
        await logPedidoEvent({ id_pedido: id, from: previousEstado, to: newEstado, description: `Cambio de estado ${previousEstado} → ${newEstado}` })
      }
    } catch (errLog) {
      // swallow logging errors
    }

    res.status(200).json(data[0])
  } catch (err) {
    console.error('Error interno al actualizar pedido:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Eliminar pedido
export const deletePedido = async (req, res) => {
  const { id } = req.params
  
  const { error } = await supabase
    .from('pedidos')
    .delete()
    .eq('id_pedido', id)

  if (error) {
    console.error('Error al eliminar pedido:', error.message)
    return res.status(400).json({ error: error.message })
  }

  res.status(204).send()
}

