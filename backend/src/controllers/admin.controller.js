import supabase from '../config/supabaseClient.js'
import bcrypt from 'bcryptjs'

// Create an admin user (requires an authenticated admin to call)
export const createAdmin = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'nombre, correo y contrasena son requeridos' })
    }

    // check existing
    const { data: existing, error: selError } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('correo', correo)

    if (selError) {
      console.error('Error checking existing user:', selError.message)
      return res.status(500).json({ error: 'Error interno' })
    }

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Este correo ya está registrado' })
    }

    const contrasena_hash = await bcrypt.hash(contrasena, 10)

    const { data, error } = await supabase
      .from('usuarios')
      .insert([
        {
          nombre,
          correo,
          contrasena_hash,
          rol: 'admin',
          fecha_registro: new Date().toISOString()
        }
      ])
      .select('id_usuario')

    if (error) {
      console.error('Error creating admin usuario:', error.message)
      return res.status(400).json({ error: error.message })
    }

    return res.status(201).json({ id_usuario: data[0].id_usuario })
  } catch (err) {
    console.error('createAdmin error:', err)
    return res.status(500).json({ error: 'Error interno' })
  }
}

// Admin-only: change a user's role
export const changeUserRole = async (req, res) => {
  try {
    const { id } = req.params // id_usuario
    const { rol } = req.body
    if (!id || !rol) return res.status(400).json({ error: 'id y rol son requeridos' })

    const allowed = ['admin', 'cliente']
    if (!allowed.includes(rol)) return res.status(400).json({ error: 'rol inválido' })

    const { data, error } = await supabase
      .from('usuarios')
      .update({ rol })
      .eq('id_usuario', id)
      .select('id_usuario, nombre, correo, rol')

    if (error) {
      console.error('Error updating role:', error.message)
      return res.status(400).json({ error: error.message })
    }

    if (!data || data.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })

    return res.status(200).json({ user: data[0] })
  } catch (err) {
    console.error('changeUserRole error:', err)
    return res.status(500).json({ error: 'Error interno' })
  }
}
