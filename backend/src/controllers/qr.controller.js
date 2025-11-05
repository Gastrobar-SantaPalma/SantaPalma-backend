import supabase from '../config/supabaseClient.js'
import { generatePngBuffer, generatePdfBuffer } from '../services/qr.service.js'

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

  // Validate mesa exists
  const { data: mesa, error } = await supabase
    .from('mesas')
    .select('id_mesa')
    .eq('id_mesa', Number(id))
    .single()

  if (error || !mesa) {
    return res.status(400).json({ error: 'Mesa no encontrada (tableId inválido)' })
  }

  // Build the URL to encode in the QR
  const venue = venueId || process.env.VENUE_ID || '1'
  // Assume frontend route: /m/{venueId}/table/{tableId}
  const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
  const url = `${CLIENT_URL}/m/${encodeURIComponent(venue)}/table/${encodeURIComponent(String(mesa.id_mesa))}`

  try {
    const saveToStorage = (process.env.SAVE_QR_TO_STORAGE || 'true') === 'true'

    if (String(format).toLowerCase() === 'pdf') {
      const pdf = await generatePdfBuffer(url, 300)

      if (saveToStorage) {
        // upload to Supabase Storage (best-effort)
        const bucket = process.env.QR_BUCKET || 'qr-codes'
        const path = `mesas/mesa-${mesa.id_mesa}/qr-${Date.now()}.pdf`
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(path, pdf, { upsert: true, contentType: 'application/pdf' })

        if (uploadErr) {
          console.error('Error subiendo PDF a storage:', uploadErr.message)
        } else {
          const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path)
          const publicUrl = publicData?.publicUrl
          // Do not persist QR URL in DB; QRs are not stored in mesas per project policy.
          // We keep the publicUrl available in uploadData if callers need it.
        }
      }

      res.setHeader('Content-Type', 'application/pdf')
      res.setHeader('Content-Disposition', `attachment; filename=mesa-${mesa.id_mesa}-qr.pdf`)
      return res.send(pdf)
    }

    const png = await generatePngBuffer(url, 300)

    if (saveToStorage) {
      const bucket = process.env.QR_BUCKET || 'qr-codes'
      const path = `mesas/mesa-${mesa.id_mesa}/qr-${Date.now()}.png`
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(path, png, { upsert: true, contentType: 'image/png' })

      if (uploadErr) {
        console.error('Error subiendo PNG a storage:', uploadErr.message)
      } else {
        const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path)
        const publicUrl = publicData?.publicUrl
        // Do not persist QR URL in DB; QRs are not stored in mesas per project policy.
        // We keep the publicUrl available in uploadData if callers need it.
      }
    }

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Disposition', `inline; filename=mesa-${mesa.id_mesa}-qr.png`)
    return res.send(png)
  } catch (err) {
    console.error('Error generando QR:', err)
    return res.status(500).json({ error: 'Error interno generando QR' })
  }
}
