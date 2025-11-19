import supabase from '../config/supabaseClient.js'
import pedidoEventsService from './pedidoEvents.service.js'

/**
 * CREA PEDIDO
 */
const createPedido = async (data) => {
  const payload = {
    ...data,
    pago: "no_pagado"  // Valor por defecto al crear
  }

  const { data: pedido, error } = await supabase
    .from('pedidos')
    .insert([payload])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return pedido
}

/**
 * ACTUALIZA PEDIDO
 */
const updatePedido = async (id, data) => {
  // Obtener estado actual del pedido
  const { data: pedidoActual, error: errFind } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id', id)
    .single()

  if (errFind || !pedidoActual) return null

  // Validar campo pago si se envía en el body
  if (data.pago !== undefined) {
    if (data.pago !== "pagado" && data.pago !== "no_pagado") {
      throw new Error("Valor inválido para pago")
    }
  }

  const payload = {
    ...data,
    pago: data.pago ?? pedidoActual.pago
  }

  // Actualizar pedido en Supabase
  const { data: pedidoActualizado, error: errUpdate } = await supabase
    .from('pedidos')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (errUpdate) throw new Error(errUpdate.message)

  // Registrar evento SOLO SI cambia el estado de pago
  if (data.pago !== undefined && data.pago !== pedidoActual.pago) {
    await pedidoEventsService.logPedidoEvent({
      id_pedido: id,
      from: pedidoActual.pago,
      to: data.pago,
      description: "Cambio de estado de pago"
    })
  }

  return pedidoActualizado
}

/**
 * OBTENER PEDIDO
 */
const getPedidoById = async (id) => {
  const { data: pedido, error } = await supabase
    .from('pedidos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return pedido
}

/**
 * LISTAR PEDIDOS
 */
const listPedidos = async () => {
  const { data: pedidos, error } = await supabase
    .from('pedidos')
    .select('*')

  if (error) throw new Error(error.message)
  return pedidos
}

/**
 * EXPORTACIÓN FINAL (RESPETANDO TU ESTILO)
 */
export default {
  createPedido,
  updatePedido,
  getPedidoById,
  listPedidos
}
