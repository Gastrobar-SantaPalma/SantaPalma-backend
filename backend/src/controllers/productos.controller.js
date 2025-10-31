import supabase from '../config/supabaseClient.js'

// Obtener todos los productos (incluye datos de la categoría)
export const getProductos = async (req, res) => {
  try {
    // Query params: page, limit, category, search
    const { page = 1, limit = 12, category, search } = req.query
    const p = Math.max(parseInt(page, 10) || 1, 1)
    const l = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100)
    const start = (p - 1) * l
    const end = start + l - 1

    let query = supabase
      .from('productos')
      .select(`
        id_producto,
        nombre,
        descripcion,
        precio,
        disponible,
        imagen_url,
        id_categoria,
        categorias ( id_categoria, nombre )
      `, { count: 'exact' })

    if (category) query = query.eq('id_categoria', category)
    if (search) query = query.ilike('nombre', `%${search}%`)

    const { data, count, error } = await query.range(start, end)

    if (error) {
      console.error('Error al obtener productos:', error.message)
      return res.status(500).json({ error: error.message })
    }

    const total = count || 0
    const totalPages = Math.ceil(total / l) || 0

    res.status(200).json({ page: p, limit: l, total, totalPages, products: data })
  } catch (err) {
    console.error('Error en getProductos:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Obtener un producto por ID
export const getProductoById = async (req, res) => {
  const { id } = req.params

  const { data, error } = await supabase
    .from('productos')
    .select(`
      id_producto,
      nombre,
      descripcion,
      precio,
      disponible,
      imagen_url,
      id_categoria,
      categorias ( id_categoria, nombre )
    `)
    .eq('id_producto', id)
    .single()

  if (error) {
    console.error('Error al obtener producto:', error.message)
    return res.status(404).json({ error: 'Producto no encontrado' })
  }

  res.status(200).json(data)
}

// Crear un nuevo producto
export const createProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, id_categoria, disponible, imagen_url } = req.body

    // required fields
    if (!nombre) return res.status(400).json({ error: 'nombre es requerido' })
    if (precio === undefined || precio === null) return res.status(400).json({ error: 'precio es requerido' })
    if (!id_categoria) return res.status(400).json({ error: 'id_categoria es requerido' })

    // precio must be a number
    const precioNum = Number(precio)
    if (Number.isNaN(precioNum) || precioNum < 0) return res.status(400).json({ error: 'precio inválido' })

    // check duplicate product name within same category (case-insensitive)
    const { data: existing, error: selErr } = await supabase
      .from('productos')
      .select('id_producto')
      .ilike('nombre', nombre)
      .eq('id_categoria', id_categoria)

    if (selErr) {
      console.error('Error checking existing producto:', selErr.message)
      return res.status(500).json({ error: 'Error interno' })
    }

    if (existing && existing.length > 0) {
      return res.status(409).json({ error: 'Ya existe un producto con ese nombre en la categoría' })
    }

    const { data, error } = await supabase
      .from('productos')
      .insert([
        { nombre, descripcion, precio: precioNum, id_categoria, disponible, imagen_url }
      ])
      .select(`
        id_producto,
        nombre,
        descripcion,
        precio,
        disponible,
        imagen_url,
        id_categoria
      `)

    if (error) {
      console.error('Error al crear producto:', error.message)
      return res.status(400).json({ error: error.message })
    }

    res.status(201).json(data[0])
  } catch (err) {
    console.error('Error interno al crear producto:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Actualizar un producto existente
export const updateProducto = async (req, res) => {
  const { id } = req.params
  try {
    const { nombre, descripcion, precio, id_categoria, disponible, imagen_url } = req.body

    // Prevent setting required fields to null if provided
    if (nombre === null) return res.status(400).json({ error: 'nombre no puede ser null' })
    if (precio === null) return res.status(400).json({ error: 'precio no puede ser null' })
    if (id_categoria === null) return res.status(400).json({ error: 'id_categoria no puede ser null' })

    // If nombre provided, check duplicates excluding current product
    if (nombre) {
      const { data: dup, error: dupErr } = await supabase
        .from('productos')
        .select('id_producto')
        .ilike('nombre', nombre)
        .neq('id_producto', id)

      if (dupErr) {
        console.error('Error checking duplicate producto:', dupErr.message)
        return res.status(500).json({ error: 'Error interno' })
      }

      if (dup && dup.length > 0) return res.status(409).json({ error: 'Ya existe un producto con ese nombre' })
    }

    const updates = { nombre, descripcion, precio, id_categoria, disponible, imagen_url }

    const { data, error } = await supabase
      .from('productos')
      .update(updates)
      .eq('id_producto', id)
      .select(`
        id_producto,
        nombre,
        descripcion,
        precio,
        disponible,
        imagen_url,
        id_categoria
      `)

    if (error) {
      console.error('Error al actualizar producto:', error.message)
      return res.status(400).json({ error: error.message })
    }

    res.status(200).json(data[0])
  } catch (err) {
    console.error('Error interno al actualizar producto:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Eliminar un producto
export const deleteProducto = async (req, res) => {
  const { id } = req.params

  const { error } = await supabase
    .from('productos')
    .delete()
    .eq('id_producto', id)

  if (error) {
    console.error('Error al eliminar producto:', error.message)
    return res.status(400).json({ error: error.message })
  }

  res.status(204).send()
}
