import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  try {
    const auth = req.headers.authorization || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
    if (!token) return res.status(401).json({ error: 'No autorizado' })

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    // small debug: attach and log basic user info to help debug role/permissions
    req.user = payload
    try { console.debug('[auth] token payload:', { id: payload.id || payload.user_id || null, rol: payload.rol || payload.role || null }) } catch (e) {}
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

export const requireRole = (role) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' })
  if (req.user.rol !== role) {
    try { console.warn('[auth] requireRole failed', { expected: role, actual: req.user.rol }) } catch (e) {}
    return res.status(403).json({ error: 'No autorizado' })
  }
  next()
}

export const requireAnyRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' })
  if (!roles.includes(req.user.rol)) {
    try { console.warn('[auth] requireAnyRole failed', { expectedAny: roles, actual: req.user.rol }) } catch (e) {}
    return res.status(403).json({ error: 'No autorizado' })
  }
  next()
}
