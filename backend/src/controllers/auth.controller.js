import supabase from '../config/supabaseClient.js'
import bcrypt from 'bcryptjs'

const passwordStrongEnough = (pwd) => {
  // >=8 chars, at least 1 uppercase, 1 number and 1 special char
  const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
  return re.test(pwd)
}

export const signup = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body
    if (!nombre || !correo || !contrasena)
      return res.status(400).json({ error: 'nombre, correo y contrasena son requeridos' })

    if (!passwordStrongEnough(contrasena)) {
      return res.status(400).json({ error: 'contrasena debe tener >=8 caracteres, 1 mayúscula, 1 número y 1 símbolo' })
    }

    // comprobar si el correo ya existe
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
          rol: 'cliente',
          fecha_registro: new Date().toISOString()
        }
      ])
      .select('id_usuario')

    if (error) {
      console.error('Error creating usuario:', error.message)
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json({ id_usuario: data[0].id_usuario })
  } catch (err) {
    console.error('Signup error:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}
