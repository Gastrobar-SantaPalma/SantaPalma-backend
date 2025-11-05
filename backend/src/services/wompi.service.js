import crypto from 'crypto'

const WOMPI_KEY = process.env.WOMPI_KEY || ''

/**
 * Crea una sesión de pago en Wompi (placeholder).
 * Si `WOMPI_KEY` está presente, aquí es donde se haría la llamada HTTP a la API de Wompi.
 * Por ahora devuelve una respuesta simulada para permitir desarrollo local.
 */
export const createPayment = async ({ pedidoId, amount, currency = 'COP', metadata = {} }) => {
  // If WOMPI_KEY is not configured, return a simulated response so dev flows keep working
  if (!WOMPI_KEY) {
    const transaction_id = `TRX-${Date.now()}`
    const checkout_url = `https://pagos.sandbox.wompi.co/checkout/${transaction_id}`
    return {
      transaction_id,
      checkout_url,
      amount,
      currency,
      metadata,
      raw: { simulated: true }
    }
  }

  // When a key is present, attempt a real call to Wompi (sandbox by default)
  try {
    const fetch = (await import('node-fetch')).default
    const isSandbox = (process.env.WOMPI_SANDBOX || 'true').toLowerCase() === 'true'
    const base = isSandbox ? 'https://sandbox.wompi.co/v1' : 'https://production.wompi.co/v1'
    const url = `${base}/transactions`

    const payload = {
      amount_in_cents: Math.round(Number(amount || 0) * 100),
      currency: currency || 'COP',
      reference: `pedido_${pedidoId}`,
      redirect_url: process.env.PAYMENTS_CALLBACK_URL || process.env.CLIENT_URL || null,
      metadata: { pedidoId, ...metadata }
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${WOMPI_KEY}`
      },
      body: JSON.stringify(payload),
      timeout: 10000
    })

    const body = await resp.json()

    // Attempt to extract transaction id and checkout url from usual Wompi response shapes
    const transaction_id = body?.data?.id || body?.data?.object?.payment?.id || null
    const checkout_url = body?.data?.attributes?.checkout_url || body?.data?.object?.payment?.checkout_url || null

    return {
      transaction_id,
      checkout_url,
      amount,
      currency,
      metadata,
      raw: body
    }
  } catch (err) {
    // On failure, fall back to a simulated response but include the error in `raw` for debugging
    const transaction_id = `TRX-ERR-${Date.now()}`
    const checkout_url = `https://pagos.sandbox.wompi.co/checkout/${transaction_id}`
    return {
      transaction_id,
      checkout_url,
      amount,
      currency,
      metadata,
      raw: { simulated: true, error: String(err) }
    }
  }
}

/**
 * Verifica la firma del webhook usando HMAC-SHA256 con el secreto `WOMPI_SIGNATURE_SECRET`.
 * Nota: adaptar si la pasarela usa otro algoritmo o esquema.
 */
export const verifyWebhookSignature = (rawBodyBuffer, signatureHeader) => {
  const secret = process.env.WOMPI_SIGNATURE_SECRET
  if (!secret) {
    // If no secret configured, do not verify (development). Caller should still proceed cautiously.
    return { ok: true, reason: 'no-secret' }
  }

  try {
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(rawBodyBuffer)
    const computed = hmac.digest('hex')
    const incoming = (signatureHeader || '').trim()
    const ok = computed === incoming
    return { ok, computed, incoming }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

export default { createPayment, verifyWebhookSignature }
