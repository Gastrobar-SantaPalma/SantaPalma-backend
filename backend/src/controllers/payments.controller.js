import supabase from '../config/supabaseClient.js'
import wompiService from '../services/wompi.service.js'

// POST /api/payments/create
export const createPayment = async (req, res) => {
  try {
    const { id_pedido } = req.body
    if (!id_pedido) return res.status(400).json({ error: 'id_pedido es requerido' })

    const { data: pedido, error: pedidoErr } = await supabase
      .from('pedidos')
      .select('id_pedido, total, estado')
      .eq('id_pedido', id_pedido)
      .maybeSingle()

    if (pedidoErr) {
      console.error('Error buscando pedido:', pedidoErr.message)
      return res.status(500).json({ error: 'Error interno' })
    }
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' })
    if (pedido.estado && pedido.estado !== 'pendiente') {
      return res.status(400).json({ error: `Pedido en estado inválido para pago: ${pedido.estado}` })
    }

    const amount = Number(pedido.total) || 0

    const payment = await wompiService.createPayment({
      pedidoId: id_pedido,
      amount,
      currency: 'COP',
      metadata: { pedidoId: id_pedido }
    })

    // Persist a payment record in pagos table
    try {
      const { data: pagoData, error: pagoErr } = await supabase
        .from('pagos')
        .insert([{
          id_pedido: id_pedido,
          transaction_id: payment.transaction_id || null,
          status: 'created',
          amount: payment.amount || amount,
          currency: payment.currency || 'COP',
          raw: payment.raw || null
        }])
        .select()

      if (pagoErr) {
        console.warn('No se pudo persistir registro de pago:', pagoErr.message)
      }
    } catch (errInsertPago) {
      console.error('Error persistiendo pago:', errInsertPago)
    }

    return res.status(200).json({ payment })
  } catch (err) {
    console.error('Error crear pago:', err)
    res.status(500).json({ error: 'Error interno creando pago' })
  }
}

// POST /api/webhooks/wompi
// Note: this handler expects the raw body (use express.raw on the route) for signature verification.
export const wompiWebhook = async (req, res) => {
  try {
    const rawBody = req.body // will be a Buffer when using express.raw
    const signatureHeader = req.get('Wompi-Signature') || req.get('x-wompi-signature') || req.get('signature')

    const verify = wompiService.verifyWebhookSignature(rawBody, signatureHeader)
    if (!verify.ok) {
      console.warn('Webhook signature verification failed', verify)
      // Reject if secret configured
      if (process.env.WOMPI_SIGNATURE_SECRET) return res.status(400).json({ error: 'Firma de webhook inválida' })
    }

    // Parse JSON payload
    let payload
    try {
      payload = JSON.parse(rawBody.toString('utf8'))
    } catch (parseErr) {
      console.error('Error parseando webhook body:', parseErr)
      return res.status(400).json({ error: 'Payload inválido' })
    }

    // Try to extract pedido id from known paths
    let pedidoId = null
    // Common Wompi payload shapes: payload.data.object.payment.metadata or payload.data.object.metadata
    try {
      pedidoId = payload?.data?.object?.payment?.metadata?.pedidoId || payload?.data?.object?.metadata?.pedidoId
    } catch (e) {
      pedidoId = null
    }

    // If not provided, try to extract from reference strings
    if (!pedidoId) {
      const reference = payload?.data?.object?.payment?.reference || payload?.data?.object?.reference || null
      if (reference) {
        // try to parse digits from `pedido_123` or similar
        const m = String(reference).match(/(\d+)/)
        if (m) pedidoId = Number(m[1])
      }
    }

    // If still no pedidoId, respond 200 to acknowledge but log for manual handling
    if (!pedidoId) {
      console.warn('Webhook recibido sin pedidoId detectable:', JSON.stringify(payload).slice(0, 200))
      return res.status(200).json({ ok: true })
    }

    // Inspect payment status
    const status = payload?.data?.object?.payment?.status || payload?.data?.object?.status || null

    // Map status to pedido estados
    let nuevoEstado = null
    if (status === 'APPROVED' || status === 'approved' || status === 'FINALIZED' || status === 'finalized' || status === 'completed') {
      nuevoEstado = 'pagado'
    } else if (status === 'PENDING' || status === 'pending') {
      nuevoEstado = 'pendiente'
    } else if (status === 'DECLINED' || status === 'declined' || status === 'FAILED') {
      nuevoEstado = 'fallido'
    }

    // Update (idempotently) pagos record if we can identify transaction_id
    const transactionId = payload?.data?.object?.payment?.id || payload?.data?.object?.payment?.transaction_id || payload?.data?.object?.payment?.transaction || null
    try {
      if (transactionId) {
        const { data: pagoUpd, error: pagoUpdErr } = await supabase
          .from('pagos')
          .update({ status: status ? String(status).toLowerCase() : null, raw: payload })
          .eq('transaction_id', transactionId)
          .select()

        if (pagoUpdErr) console.warn('No se pudo actualizar registro de pago por transaction_id:', pagoUpdErr.message)
      } else {
        // Try to match by id_pedido and recent created_at if transaction id not provided
        const { data: pagoByPedido, error: pagoByPedidoErr } = await supabase
          .from('pagos')
          .select('*')
          .eq('id_pedido', pedidoId)
          // Some DBs may not have 'created_at' if migration wasn't applied; fallback to ordering by primary key
          .order('id_pago', { ascending: false })
          .limit(1)

        if (!pagoByPedidoErr && pagoByPedido && pagoByPedido.length > 0) {
          await supabase
            .from('pagos')
            .update({ status: status ? String(status).toLowerCase() : null, raw: payload })
            .eq('id_pago', pagoByPedido[0].id_pago)
        }
      }
    } catch (errPagoUpdate) {
      console.error('Error actualizando pagos desde webhook:', errPagoUpdate)
    }

    // Update pedido row accordingly (idempotent)
    const updates = {}
    if (nuevoEstado) updates.estado = nuevoEstado

    const { data, error } = await supabase
      .from('pedidos')
      .update(updates)
      .eq('id_pedido', pedidoId)
      .select('id_pedido, estado')

    if (error) {
      console.error('Error actualizando pedido desde webhook:', error.message)
      return res.status(500).json({ error: 'Error interno actualizando pedido' })
    }

    return res.status(200).json({ ok: true, updated: data && data[0] })
  } catch (err) {
    console.error('Error manejando webhook wompi:', err)
    return res.status(500).json({ error: 'Error interno' })
  }
}

export default { createPayment, wompiWebhook }
