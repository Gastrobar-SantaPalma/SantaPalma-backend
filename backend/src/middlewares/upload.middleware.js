import multer from 'multer'

// Use memory storage so we can forward the buffer to Supabase SDK
const storage = multer.memoryStorage()

/**
 * Middleware de Multer para carga de imágenes.
 * Almacena en memoria, limita a 5MB y filtra por tipo de imagen (JPEG, PNG, WEBP).
 */
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error('Only JPEG, PNG or WEBP images are allowed'))
  }
})

export default upload
