import usuarioService from '../services/usuario.service.js'

// Obtener todos los usuarios
export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.getUsuarios()
    res.json(usuarios)
  } catch (error) {
    console.error('Error al obtener usuarios:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// Obtener un usuario por ID
export const getUsuarioById = async (req, res) => {
  const { id } = req.params
  try {
    const usuario = await usuarioService.getUsuarioById(id)
    res.json(usuario)
  } catch (error) {
    console.error('Error al obtener usuario:', error)
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ error: error.message })
    }
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// Crear un nuevo usuario
export const createUsuario = async (req, res) => {
  try {
    const nuevoUsuario = await usuarioService.createUsuario(req.body)
    res.status(201).json(nuevoUsuario)
  } catch (error) {
    console.error('Error al crear usuario:', error)
    if (error.message === 'El correo ya está registrado') {
      return res.status(409).json({ error: error.message })
    }
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// Actualizar un usuario existente
export const updateUsuario = async (req, res) => {
  const { id } = req.params
  try {
    const usuarioActualizado = await usuarioService.updateUsuario(id, req.body)
    res.json(usuarioActualizado)
  } catch (error) {
    console.error('Error al actualizar usuario:', error)
    if (error.message === 'Usuario no encontrado') {
      return res.status(404).json({ error: error.message })
    }
    if (error.message === 'El correo ya está registrado') {
      return res.status(409).json({ error: error.message })
    }
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

// Eliminar usuario
export const deleteUsuario = async (req, res) => {
  const { id } = req.params
  try {
    await usuarioService.deleteUsuario(id)
    res.status(204).send()
  } catch (error) {
    console.error('Error al eliminar usuario:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
