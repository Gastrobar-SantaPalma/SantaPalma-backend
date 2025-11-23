import authService from '../services/auth.service.js'
import jwt from 'jsonwebtoken'

// Simple in-memory rate limiter for login attempts per email
const failedLogins = {} // { [email]: { count, firstAttemptTs } }
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export const signup = async (req, res) => {
  try {
    const newUser = await authService.signup(req.body)
    res.status(201).json({ id_usuario: newUser.id_usuario })
  } catch (err) {
    console.error('Signup error:', err)
    if (err.message === 'Este correo ya está registrado') {
      return res.status(409).json({ error: err.message })
    }
    if (err.message.includes('requeridos') || err.message.includes('contrasena debe tener')) {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: 'Error interno' })
  }
}

export const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body
    
    // Rate limiting by email
    const now = Date.now()
    const entry = failedLogins[correo]
    if (entry) {
      if (now - entry.firstAttemptTs < WINDOW_MS && entry.count >= MAX_ATTEMPTS) {
        return res.status(429).json({ error: 'Demasiados intentos. Intenta más tarde.' })
      }
      if (now - entry.firstAttemptTs >= WINDOW_MS) {
        // reset window
        delete failedLogins[correo]
      }
    }

    try {
      const usuario = await authService.login(correo, contrasena)
      
      const payload = { id: usuario.id_usuario, correo: usuario.correo, rol: usuario.rol }
      const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' })

      // on successful login reset failed attempts for this email
      if (failedLogins[correo]) delete failedLogins[correo]

      res.status(200).json({ token, usuario })
    } catch (authError) {
      // record failed attempt
      if (!failedLogins[correo]) failedLogins[correo] = { count: 1, firstAttemptTs: now }
      else failedLogins[correo].count++
      
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

  } catch (err) {
    console.error('Error en login:', err)
    res.status(500).json({ error: 'Error interno al autenticar' })
  }
}
