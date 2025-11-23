import usuarioService from '../services/usuario.service.js'

/**
 * Crea un nuevo usuario administrador.
 * Requiere autenticación de administrador.
 * 
 * @param {import('express').Request} req - Objeto de solicitud Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>}
 */
export const createAdmin = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'nombre, correo y contrasena son requeridos' })
    }

    const newUser = await usuarioService.createUsuario({
      nombre,
      correo,
      contrasena,
      rol: 'admin'
    })

    return res.status(201).json({ id_usuario: newUser.id_usuario })
  } catch (err) {
    console.error('createAdmin error:', err)
    if (err.message === 'El correo ya está registrado') {
      return res.status(409).json({ error: err.message })
    }
    return res.status(500).json({ error: 'Error interno' })
  }
}

/**
 * Cambia el rol de un usuario.
 * Solo accesible por administradores.
 * 
 * @param {import('express').Request} req - Objeto de solicitud Express.
 * @param {import('express').Response} res - Objeto de respuesta Express.
 * @returns {Promise<void>}
 */
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params // id_usuario
    const { rol } = req.body
    if (!id || !rol) return res.status(400).json({ error: 'id y rol son requeridos' })

    const allowed = ['admin', 'cliente']
    if (!allowed.includes(rol)) return res.status(400).json({ error: 'rol inválido' })

    const updatedUser = await usuarioService.updateUsuario(id, { rol })

    return res.status(200).json({ user: updatedUser })
  } catch (err) {
    console.error('changeUserRole error:', err)
    if (err.message === 'Usuario no encontrado') {
      return res.status(404).json({ error: err.message })
    }
    return res.status(500).json({ error: 'Error interno' })
  }
}
