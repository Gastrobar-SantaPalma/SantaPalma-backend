import supabase from '../config/supabaseClient.js'

class ProductoRepository {
  async findAll({ page = 1, limit = 12, category, search }) {
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
        promedio_calificacion,
        cantidad_calificaciones,
        categorias ( id_categoria, nombre )
      `, { count: 'exact' })

    if (category) query = query.eq('id_categoria', category)
    if (search) query = query.ilike('nombre', `%${search}%`)
    
    query = query.order('nombre', { ascending: true })

    const { data, count, error } = await query.range(start, end)

    if (error) throw new Error(error.message)

    return { data, count, page: p, limit: l }
  }

  async findById(id) {
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
        promedio_calificacion,
        cantidad_calificaciones,
        categorias ( id_categoria, nombre )
      `)
      .eq('id_producto', id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data
  }

  async findByIds(ids) {
    if (!ids || ids.length === 0) return []
    
    const { data, error } = await supabase
      .from('productos')
      .select('id_producto, nombre, precio, disponible')
      .in('id_producto', ids)

    if (error) throw new Error(error.message)
    return data
  }

  async findByNameAndCategory(nombre, id_categoria) {
    const { data, error } = await supabase
      .from('productos')
      .select('id_producto')
      .ilike('nombre', nombre)
      .eq('id_categoria', id_categoria)

    if (error) throw new Error(error.message)
    return data
  }

  async findByNameExcludingId(nombre, id_producto) {
    const { data, error } = await supabase
      .from('productos')
      .select('id_producto')
      .ilike('nombre', nombre)
      .neq('id_producto', id_producto)

    if (error) throw new Error(error.message)
    return data
  }

  async create(productoData) {
    const { data, error } = await supabase
      .from('productos')
      .insert([productoData])
      .select(`
        id_producto,
        nombre,
        descripcion,
        precio,
        disponible,
        imagen_url,
        id_categoria
      `)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async update(id, updates) {
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
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  async delete(id) {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id_producto', id)

    if (error) throw new Error(error.message)
    return true
  }

  // Ratings & Comments
  async getComments(productId, { page = 1, limit = 5 }) {
    const p = Math.max(parseInt(page, 10) || 1, 1)
    const l = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50)
    const start = (p - 1) * l
    const end = start + l - 1

    const { data, count, error } = await supabase
      .from('calificaciones_producto')
      .select('id_calificacion, puntuacion, comentario, fecha_creacion', { count: 'exact' })
      .eq('id_producto', productId)
      .order('fecha_creacion', { ascending: false })
      .range(start, end)

    if (error) throw new Error(error.message)
    return { data, count, page: p, limit: l }
  }

  async upsertRating(ratingData) {
    const { data, error } = await supabase
      .from('calificaciones_producto')
      .upsert(ratingData, { onConflict: 'id_producto, id_usuario' })
      .select()
      .single()

    if (error) {
      if (error.code === '23503') throw new Error('Producto no encontrado')
      throw new Error(error.message)
    }
    return data
  }
}

export default new ProductoRepository()

