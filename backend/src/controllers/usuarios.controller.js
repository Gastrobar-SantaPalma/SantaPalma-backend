import supabase from '../config/supabaseClient.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Simple in-memory rate limiter for login attempts per email
const failedLogins = {} // { [email]: { count, firstAttemptTs } }
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

// Obtener todos los usuarios
export const getUsuarios = async (req, res) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      id_usuario,
      nombre,
      correo,
      rol,
      fecha_registro
    `)

  if (error) {
    console.error('Error al obtener usuarios:', error.message)
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
}

// Obtener un usuario por ID
export const getUsuarioById = async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      id_usuario,
      nombre,
      correo,
      rol,
      fecha_registro
    `)
    .eq('id_usuario', id)
    .single()

  if (error) {
    console.error('Error al obtener usuario:', error.message)
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }

  res.status(200).json(data)
}

// Crear un nuevo usuario
export const createUsuario = async (req, res) => {
  const { nombre, correo, contrasena, rol, fecha_registro } = req.body

  if (!contrasena) {
    return res.status(400).json({ error: 'contrasena es requerida' })
  }

  // Hashear la contraseña antes de guardar
  const contrasena_hash = await bcrypt.hash(contrasena, 10)

  const { data, error } = await supabase
    .from('usuarios')
    .insert([
      { nombre, correo, contrasena_hash, rol, fecha_registro }
    ])
    .select(`
      id_usuario,
      nombre,
      correo,
      rol,
      fecha_registro
    `)

  if (error) {
    console.error('Error al crear usuario:', error.message)
    return res.status(400).json({ error: error.message })
  }

  res.status(201).json(data[0])
}


// Actualizar un usuario existente
export const updateUsuario = async (req, res) => {
  const { id } = req.params
  let { nombre, correo, contrasena, contrasena_hash, rol, fecha_registro } = req.body

  // Si envían contrasena en texto, hashearla
  if (contrasena) {
    contrasena_hash = await bcrypt.hash(contrasena, 10)
  }

  const { data, error } = await supabase
    .from('usuarios')
    .update({ nombre, correo, contrasena_hash, rol, fecha_registro })
    .eq('id_usuario', id)
    .select(`
      id_usuario,
      nombre,
      correo,
      rol,
      fecha_registro
    `)

  if (error) {
    console.error('Error al actualizar usuario:', error.message)
    return res.status(400).json({ error: error.message })
  }

  res.status(200).json(data[0])
}

// Eliminar usuario
export const deleteUsuario = async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('usuarios')
    .delete()
    .eq('id_usuario', id)

  if (error) {
    console.error('Error al eliminar usuario:', error.message)
    return res.status(400).json({ error: error.message })
  }

  res.status(204).send()
}

// Login de usuario
export const loginUsuario = async (req, res) => {
  try {
    const { correo, contrasena } = req.body
    if (!correo || !contrasena) return res.status(400).json({ error: 'correo y contrasena son requeridos' })

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

    const { data, error } = await supabase
      .from('usuarios')
      .select(`id_usuario, nombre, correo, contrasena_hash, rol`)
      .eq('correo', correo)
      .single()

    if (error || !data) {
      // record failed attempt
      if (!failedLogins[correo]) failedLogins[correo] = { count: 1, firstAttemptTs: now }
      else failedLogins[correo].count++
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const usuario = data

    const match = await bcrypt.compare(contrasena, usuario.contrasena_hash)
    if (!match) {
      if (!failedLogins[correo]) failedLogins[correo] = { count: 1, firstAttemptTs: now }
      else failedLogins[correo].count++
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const payload = { id: usuario.id_usuario, correo: usuario.correo, rol: usuario.rol }
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '8h' })

  // No devolver el hash
  delete usuario.contrasena_hash

  // on successful login reset failed attempts for this email
  if (failedLogins[correo]) delete failedLogins[correo]

    res.status(200).json({ token, usuario })
  } catch (err) {
    console.error('Error en login:', err)
    res.status(500).json({ error: 'Error interno al autenticar' })
  }
}
