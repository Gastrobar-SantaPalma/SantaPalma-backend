import supabase from '../config/supabaseClient.js'

// Listar todas las categorias
export const getCategorias = async (req, res) => {
  const { data, error } = await supabase
    .from('categorias')
    .select(`
      id_categoria,
      nombre,
      descripcion,
      activo
    `)

  if (error) {
    console.error('Error al obtener categorias:', error.message)
    return res.status(500).json({ error: error.message })
  }

  res.status(200).json(data)
}

// Obtener categoria por ID
export const getCategoriaById = async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('categorias')
    .select(`
      id_categoria,
      nombre,
      descripcion,
      activo
    `)
    .eq('id_categoria', id)
    .single()

  if (error) {
    console.error('Error al obtener categoria:', error.message)
    return res.status(404).json({ error: 'Categoria no encontrada' })
  }

  res.status(200).json(data)
}

// Crear categoria
export const createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, activo = true } = req.body

    if (!nombre) return res.status(400).json({ error: 'nombre es requerido' })

    // check duplicate category name (case-insensitive)
    const { data: existing, error: selErr } = await supabase
      .from('categorias')
      .select('id_categoria')
      .ilike('nombre', nombre)

    if (selErr) {
      console.error('Error checking existing categoria:', selErr.message)
      return res.status(500).json({ error: 'Error interno' })
    }

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' })
    }

    const { data, error } = await supabase
      .from('categorias')
      .insert([{ nombre, descripcion, activo }])
      .select(`id_categoria, nombre, descripcion, activo`)

    if (error) {
      // If the DB does not have the 'activo' column (schema mismatch), retry without it
      console.error('Error al crear categoria:', error.message)
      if (error.message && error.message.includes("Could not find the 'activo' column")) {
        const { data: fallbackData, error: fallbackErr } = await supabase
          .from('categorias')
          .insert([{ nombre, descripcion }])
          .select('id_categoria, nombre, descripcion')

        if (fallbackErr) {
          console.error('Fallback error al crear categoria:', fallbackErr.message)
          return res.status(400).json({ error: fallbackErr.message })
        }

        return res.status(201).json(fallbackData[0])
      }

      return res.status(400).json({ error: error.message })
    }

    res.status(201).json(data[0])
  } catch (err) {
    console.error('Error interno al crear categoria:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Actualizar categoria
export const updateCategoria = async (req, res) => {
  const { id } = req.params
  const { nombre, descripcion, activo } = req.body
  try {
    // Prevent nulls
    if (nombre === null) return res.status(400).json({ error: 'nombre no puede ser null' })

    // If nombre provided, check duplicate excluding current id
    if (nombre) {
      const { data: dup, error: dupErr } = await supabase
        .from('categorias')
        .select('id_categoria')
        .ilike('nombre', nombre)
        .neq('id_categoria', id)

      if (dupErr) {
        console.error('Error checking duplicate categoria:', dupErr.message)
        return res.status(500).json({ error: 'Error interno' })
      }

      if (dup && dup.length > 0) return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' })
    }

    const { data, error } = await supabase
      .from('categorias')
      .update({ nombre, descripcion, activo })
      .eq('id_categoria', id)
      .select(`id_categoria, nombre, descripcion, activo`)

    if (error) {
      console.error('Error al actualizar categoria:', error.message)
      return res.status(400).json({ error: error.message })
    }

    if (!data || data.length === 0) return res.status(404).json({ error: 'Categoria no encontrada' })

    res.status(200).json(data[0])
  } catch (err) {
    console.error('Error interno al actualizar categoria:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Eliminar categoria
export const deleteCategoria = async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('categorias')
    .delete()
    .eq('id_categoria', id)

  if (error) {
    console.error('Error al eliminar categoria:', error.message)
    return res.status(400).json({ error: error.message })
  }

  res.status(204).send()
}
