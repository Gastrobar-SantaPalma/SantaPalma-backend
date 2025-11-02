import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ error: 'No autorizado' })

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

export const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' })
  if (req.user.rol !== role) return res.status(403).json({ error: 'No autorizado' })
  next()
}

export const requireAnyRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' })
  if (!roles.includes(req.user.rol)) return res.status(403).json({ error: 'No autorizado' })
  next()
}
