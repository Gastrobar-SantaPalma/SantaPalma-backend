import supabase from '../config/supabaseClient.js'

/**
 * Inserta un evento de pedido en la tabla `pedido_eventos`.
 * Esta operación es best-effort: si falla, no se propaga el error al caller.
 */
export const logPedidoEvent = async ({ id_pedido, from = null, to = null, description = null }) => {
  try {
    const payload = {
      id_pedido,
      descripcion: description,
      estado_anterior: from,
      estado_nuevo: to
    }

    const { error } = await supabase
      .from('pedido_eventos')
      .insert([payload])

    if (error) {
      // Log and swallow — not critical for main flow
      console.error('No se pudo insertar evento en pedido_eventos:', error.message)
    }
  } catch (err) {
    console.error('Excepción al loguear evento de pedido:', err)
  }
}

export default { logPedidoEvent }
