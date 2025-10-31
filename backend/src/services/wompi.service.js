import crypto from 'crypto'

const WOMPI_KEY = process.env.WOMPI_KEY || ''

/**
 * Crea una sesión de pago en Wompi (placeholder).
 * Si `WOMPI_KEY` está presente, aquí es donde se haría la llamada HTTP a la API de Wompi.
 * Por ahora devuelve una respuesta simulada para permitir desarrollo local.
 */
export const createPayment = async ({ pedidoId, amount, currency = 'COP', metadata = {} }) => {
  // TODO: Implementar llamada real a Wompi usando WOMPI_KEY
  // Ejemplo de payload que se enviaría a Wompi: amount, currency, reference, redirect_url, metadata

  // Simulación: generar transaction_id y checkout_url ficticios
  const transaction_id = `TRX-${Date.now()}`
  const checkout_url = `https://pagos.sandbox.wompi.co/checkout/${transaction_id}`

  return {
    transaction_id,
    checkout_url,
    amount,
    currency,
    metadata,
    // raw: placeholder to store full response if needed
    raw: { simulated: true }
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
