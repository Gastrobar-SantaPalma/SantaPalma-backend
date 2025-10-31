import supabase from '../config/supabaseClient.js'
import { calcularTotal } from '../utils/calculateTotal.js'

// Obtener todos los pedidos
export const getPedidos = async (req, res) => {
  const { data, error } = await supabase
    .from('pedidos')
    .select('id_pedido, estado, total, fecha_pedido')
  
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
}

// Obtener un pedido por ID
export const getPedidoById = async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('pedidos')
    .select(`
      id_pedido,
      estado,
      total,
      fecha_pedido )
    `)
    .eq('id_pedido', id)
    .single()

  if (error) {
    console.error('Error al obtener pedido:', error.message)
    return res.status(404).json({ error: 'Pedido no encontrado' })
  }

  res.status(200).json(data)
}

// Crear un nuevo pedido
export const createPedido = async (req, res) => {
  try {
    const { id_cliente, id_mesa, items, total } = req.body

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

    // Validate items shape and compute subtotal per item
    for (const it of items) {
      if (!it.id_producto) return res.status(400).json({ error: 'cada item debe tener id_producto' })
      if (it.cantidad === undefined || it.cantidad === null) return res.status(400).json({ error: 'cada item debe tener cantidad' })
      if (it.precio === undefined || it.precio === null) return res.status(400).json({ error: 'cada item debe tener precio' })

      const cantidadNum = Number(it.cantidad)
      const precioNum = Number(it.precio)
      if (Number.isNaN(cantidadNum) || cantidadNum <= 0) return res.status(400).json({ error: 'cantidad inválida en un item' })
      if (Number.isNaN(precioNum) || precioNum < 0) return res.status(400).json({ error: 'precio inválido en un item' })

      // normalize fields
      it.cantidad = cantidadNum
      it.precio = precioNum
      it.subtotal = Number((precioNum * cantidadNum).toFixed(2))
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
    let { id_cliente, id_mesa, estado, total, items } = req.body

    // If items provided, validate them similarly to create
    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items debe ser un arreglo con al menos un elemento' })
      for (const it of items) {
        if (!it.id_producto) return res.status(400).json({ error: 'cada item debe tener id_producto' })
        if (it.cantidad === undefined || it.cantidad === null) return res.status(400).json({ error: 'cada item debe tener cantidad' })
        if (it.precio === undefined || it.precio === null) return res.status(400).json({ error: 'cada item debe tener precio' })

        const cantidadNum = Number(it.cantidad)
        const precioNum = Number(it.precio)
        if (Number.isNaN(cantidadNum) || cantidadNum <= 0) return res.status(400).json({ error: 'cantidad inválida en un item' })
        if (Number.isNaN(precioNum) || precioNum < 0) return res.status(400).json({ error: 'precio inválido en un item' })

        it.cantidad = cantidadNum
        it.precio = precioNum
        it.subtotal = Number((precioNum * cantidadNum).toFixed(2))
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

    const updates = { id_cliente, id_mesa, estado, total }
    if (items !== undefined) updates.items = items

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
        fecha_pedido,
        items
      `)

    if (error) {
      console.error('Error al actualizar pedido:', error.message)
      if (error.message && error.message.includes("Could not find the 'items' column")) {
        return res.status(500).json({ error: "La tabla 'pedidos' no tiene la columna 'items'. Ejecuta ALTER TABLE pedidos ADD COLUMN items jsonb; en la base de datos." })
      }
      return res.status(400).json({ error: error.message })
    }

    if (!data || data.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' })

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