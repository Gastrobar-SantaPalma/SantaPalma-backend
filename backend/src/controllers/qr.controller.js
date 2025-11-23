import { generateAndUploadQr } from '../services/qr.service.js'

/**
 * Genera un código QR (PNG o PDF) para una mesa específica.
 * Ruta protegida para administradores.
 * 
 * @param {import('express').Request} req - Objeto de solicitud de Express.
 * @param {import('express').Response} res - Objeto de respuesta de Express.
 * @returns {Promise<void>}
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
