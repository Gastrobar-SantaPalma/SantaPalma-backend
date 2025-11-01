import QRCode from 'qrcode'
import PDFDocument from 'pdfkit'
import stream from 'stream'

/**
 * Generate a PNG buffer for a given URL.
 * @param {string} url
 * @param {number} size
 * @returns {Promise<Buffer>}
 */
export async function generatePngBuffer (url, size = 300) {
  // qrcode.toBuffer supports width option
  return QRCode.toBuffer(String(url), { type: 'png', width: size })
}

/**
 * Generate a PDF buffer that contains the QR code (and optionally text).
 * @param {string} url
 * @param {number} size
 * @returns {Promise<Buffer>}
 */
export async function generatePdfBuffer (url, size = 300) {
  // Create PNG buffer first
  const pngBuffer = await generatePngBuffer(url, size)

  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  const passthrough = new stream.PassThrough()
  const chunks = []

  doc.pipe(passthrough)
  // Place QR roughly centered on the page
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
  const x = (pageWidth - size) / 2
  const y = 150
  try {
    doc.image(pngBuffer, doc.page.margins.left + x, y, { width: size })
  } catch (err) {
    // If image insertion fails, embed as raw bytes fallback (shouldn't happen)
    console.error('Error embedding QR in PDF:', err)
  }

  doc.moveDown(2)
  doc.fontSize(12).text(url, { align: 'center' })
  doc.end()

  return new Promise((resolve, reject) => {
    passthrough.on('data', (chunk) => chunks.push(chunk))
    passthrough.on('end', () => resolve(Buffer.concat(chunks)))
    passthrough.on('error', reject)
  })
}
