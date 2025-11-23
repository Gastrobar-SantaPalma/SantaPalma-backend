import { generateAndUploadQr } from '../services/qr.service.js'

/**
 * POST /api/mesas/:id/generate-qr
 * Generates a QR (PNG or PDF) for the given mesa id. Protected route for admins.
 * Query params:
 * - format=pdf -> returns application/pdf, otherwise returns image/png
 * - venueId (optional) -> if provided, used in the URL; otherwise falls back to ENV VENUE_ID or '1'
 */
export async function generateQr (req, res) {
  const { id } = req.params
  const { format, venueId } = req.query

  try {
    const { buffer, contentType, filename } = await generateAndUploadQr(id, format, venueId)

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`)
    return res.send(buffer)
  } catch (err) {
    console.error('Error generando QR:', err)
    if (err.message === 'Mesa no encontrada') {
      return res.status(404).json({ error: err.message })
    }
    return res.status(500).json({ error: 'Error interno generando QR' })
  }
}
