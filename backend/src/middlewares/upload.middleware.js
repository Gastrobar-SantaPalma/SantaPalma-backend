import multer from 'multer'

// Use memory storage so we can forward the buffer to Supabase SDK
const storage = multer.memoryStorage()

// Accept only image mimetypes and limit size to 5 MB
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
