import supabase from '../config/supabaseClient.js'
import crypto from 'crypto'

function getStoragePathFromPublicUrl(publicUrl, bucket) {
  if (!publicUrl) return null
  try {
    // Supabase public url format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const marker = `/storage/v1/object/public/${bucket}/`
    const idx = publicUrl.indexOf(marker)
    if (idx === -1) return null
    return publicUrl.substring(idx + marker.length)
  } catch (err) {
    return null
  }
}

// Obtener todos los productos (incluye datos de la categoría)
export const getProductos = async (req, res) => {
  try {
    // Query params: page, limit, category, search
    const { page = 1, limit = 12, category, search } = req.query

    // Validate page and limit
    const pRaw = String(page)
    const lRaw = String(limit)
    if (!/^[0-9]+$/.test(pRaw) || !/^[0-9]+$/.test(lRaw)) {
      return res.status(400).json({ error: 'page and limit must be positive integers' })
    }

    const p = Math.max(parseInt(pRaw, 10) || 1, 1)
    const l = Math.min(Math.max(parseInt(lRaw, 10) || 12, 1), 100)
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
    // If category filter is provided, verify the category exists
    if (category) {
      // category can be sent as id or name; expect id_categoria numeric in this API
      const { data: catData, error: catErr } = await supabase
        .from('categorias')
        .select('id_categoria')
        .eq('id_categoria', category)
        .limit(1)

      if (catErr) {
        console.error('Error checking category existence:', catErr.message)
        return res.status(500).json({ error: 'Error interno' })
      }

      if (!catData || catData.length === 0) {
        return res.status(404).json({ error: 'Categoría no encontrada' })
      }

      query = query.eq('id_categoria', category)
    }
    if (search) query = query.ilike('nombre', `%${search}%`)
    // Order products alphabetically by name (HU1.2 requirement)
    query = query.order('nombre', { ascending: true })

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
  try {
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

    if (error) {
      console.error('Error al obtener producto:', error.message)
      return res.status(500).json({ error: 'Error interno' })
    }

    if (!data) return res.status(404).json({ error: 'Producto no encontrado' })

    // Fetch last 5 comments
    const { data: comments, error: commentsErr } = await supabase
      .from('calificaciones_producto')
      .select('id_calificacion, puntuacion, comentario, fecha_creacion')
      .eq('id_producto', id)
      .order('fecha_creacion', { ascending: false })
      .limit(5)

    if (commentsErr) {
      console.warn('Error fetching comments:', commentsErr.message)
      // Return empty array on error to avoid breaking the UI, but log it.
      // In strict mode, we might want to return 500, but for auxiliary data like comments, degradation is preferred.
    }
    
    data.comentarios = comments || []

    res.status(200).json(data)
  } catch (err) {
    console.error('Error en getProductoById:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Crear un nuevo producto
export const createProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, id_categoria, disponible } = req.body
    let { imagen_url } = req.body

    // If an image file was uploaded via multer, upload it to Supabase Storage
    if (req.file) {
      try {
        console.log('createProducto: received file ->', { originalname: req.file.originalname, mimetype: req.file.mimetype, size: req.file.size })
        const bucket = process.env.PRODUCT_IMAGES_BUCKET || 'product-images'
        const original = req.file.originalname || 'image'
        const safeName = original.replace(/[^a-zA-Z0-9_.-]/g, '_')
        const filename = `productos/${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${safeName}`

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(filename, req.file.buffer, { contentType: req.file.mimetype })

        console.log('createProducto: upload result', { uploadData, uploadErr })

        if (uploadErr) {
          console.error('Error subiendo imagen a storage:', uploadErr.message || uploadErr)
          return res.status(500).json({ error: 'Error subiendo imagen' })
        }

        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filename)
        console.log('createProducto: publicUrlData', publicUrlData)
        imagen_url = publicUrlData?.publicUrl || null
      } catch (upErr) {
        console.error('Error procesando imagen:', upErr)
        return res.status(500).json({ error: 'Error interno al procesar imagen' })
      }
    }

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
    const { nombre, descripcion, precio, id_categoria, disponible } = req.body
    let { imagen_url } = req.body

    // If an image file was uploaded via multer, upload to Supabase Storage and override imagen_url
    if (req.file) {
      // For update case, fetch existing product to possibly delete old image after new upload
      let existingProduct = null
      try {
        const { data: exData } = await supabase
          .from('productos')
          .select('imagen_url')
          .eq('id_producto', id)
          .single()
        existingProduct = exData
      } catch (e) {
        // ignore error; we will still attempt upload
        existingProduct = null
      }
      try {
        const bucket = process.env.PRODUCT_IMAGES_BUCKET || 'product-images'
        const original = req.file.originalname || 'image'
        const safeName = original.replace(/[^a-zA-Z0-9_.-]/g, '_')
        const filename = `productos/${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${safeName}`

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from(bucket)
          .upload(filename, req.file.buffer, { contentType: req.file.mimetype })

        if (uploadErr) {
          console.error('Error subiendo imagen a storage:', uploadErr.message || uploadErr)
          return res.status(500).json({ error: 'Error subiendo imagen' })
        }

        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filename)
        imagen_url = publicUrlData?.publicUrl || null

        // If we uploaded a new image successfully and there was an existing image, try to remove it
        if (existingProduct && existingProduct.imagen_url) {
          try {
            const oldPath = getStoragePathFromPublicUrl(existingProduct.imagen_url, bucket)
            if (oldPath) {
              await supabase.storage.from(bucket).remove([oldPath])
            }
          } catch (rmErr) {
            // Log and continue — deletion failure should not block update
            console.warn('No se pudo eliminar imagen anterior:', rmErr)
          }
        }
      } catch (upErr) {
        console.error('Error procesando imagen:', upErr)
        return res.status(500).json({ error: 'Error interno al procesar imagen' })
      }
    }

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

  try {
    // Try to fetch existing product to remove image from storage if present
    const { data: existing, error: fetchErr } = await supabase
      .from('productos')
      .select('imagen_url')
      .eq('id_producto', id)
      .maybeSingle()

    if (fetchErr) {
      console.error('Error obteniendo producto previo a eliminación:', fetchErr.message)
      // continue to attempt deletion in DB below
    }

    if (existing && existing.imagen_url) {
      try {
        const bucket = process.env.PRODUCT_IMAGES_BUCKET || 'product-images'
        const oldPath = getStoragePathFromPublicUrl(existing.imagen_url, bucket)
        if (oldPath) {
          const { error: rmErr } = await supabase.storage.from(bucket).remove([oldPath])
          if (rmErr) console.warn('No se pudo eliminar imagen del storage:', rmErr)
        }
      } catch (rmEx) {
        console.warn('Error intentando eliminar imagen del storage:', rmEx)
      }
    }

    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id_producto', id)

    if (error) {
      console.error('Error al eliminar producto:', error.message)
      return res.status(400).json({ error: error.message })
    }

    res.status(204).send()
  } catch (err) {
    console.error('Error interno al eliminar producto:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Calificar un producto
export const rateProduct = async (req, res) => {
  const { id } = req.params
  const { puntuacion, comentario } = req.body
  const id_usuario = req.user.id

  // Validate product ID
  const productId = parseInt(id, 10)
  if (isNaN(productId)) return res.status(400).json({ error: 'ID de producto inválido' })

  // Validate score type and range
  if (typeof puntuacion !== 'number' || !Number.isInteger(puntuacion) || puntuacion < 1 || puntuacion > 5) {
    return res.status(400).json({ error: 'Puntuación inválida (debe ser un entero entre 1 y 5)' })
  }

  try {
    // 1. Validate Purchase: Check if user has a paid order containing this product
    const { data: orders, error: orderErr } = await supabase
      .from('pedidos')
      .select('id_pedido, items, pago')
      .eq('id_cliente', id_usuario)
      .eq('pago', 'pagado')
    
    if (orderErr) {
      console.error('Error checking orders:', orderErr.message)
      return res.status(500).json({ error: 'Error interno verificando compra' })
    }

    // Check if any order contains the product
    const validOrder = orders.find(order => {
      if (!Array.isArray(order.items)) return false
      return order.items.some(item => Number(item.id_producto) === productId)
    })

    if (!validOrder) {
      return res.status(403).json({ error: 'Debes comprar y pagar el producto para calificarlo' })
    }

    // 2. Upsert Rating
    // Note: We do NOT set fecha_creacion here to allow the DB default (NOW()) to persist on updates if desired,
    // or if we want to update the timestamp on edit, we should use a separate 'updated_at' column.
    // For now, we'll let the DB handle creation time and only update score/comment.
    const { data, error } = await supabase
      .from('calificaciones_producto')
      .upsert({
        id_producto: productId,
        id_usuario: id_usuario,
        id_pedido: validOrder.id_pedido,
        puntuacion,
        comentario
      }, { onConflict: 'id_producto, id_usuario' })
      .select()

    if (error) {
      console.error('Error saving rating:', error.message)
      // Check for foreign key violation (product not found)
      if (error.code === '23503') { // PostgreSQL foreign_key_violation
         return res.status(404).json({ error: 'Producto no encontrado' })
      }
      return res.status(500).json({ error: 'Error guardando calificación' })
    }

    res.status(200).json(data?.[0] || { success: true })
  } catch (err) {
    console.error('Error in rateProduct:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}

// Obtener comentarios paginados
export const getProductComments = async (req, res) => {
  const { id } = req.params
  const { page = 1, limit = 5 } = req.query
  
  const productId = parseInt(id, 10)
  if (isNaN(productId)) return res.status(400).json({ error: 'ID de producto inválido' })

  const p = Math.max(parseInt(page, 10) || 1, 1)
  const l = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 50)
  const start = (p - 1) * l
  const end = start + l - 1

  try {
    const { data, count, error } = await supabase
      .from('calificaciones_producto')
      .select('id_calificacion, puntuacion, comentario, fecha_creacion', { count: 'exact' })
      .eq('id_producto', productId)
      .order('fecha_creacion', { ascending: false })
      .range(start, end)

    if (error) {
      console.error('Error fetching comments:', error.message)
      return res.status(500).json({ error: 'Error obteniendo comentarios' })
    }

    const total = count || 0
    const totalPages = Math.ceil(total / l) || 0

    res.status(200).json({ page: p, limit: l, total, totalPages, comments: data })
  } catch (err) {
    console.error('Error in getProductComments:', err)
    res.status(500).json({ error: 'Error interno' })
  }
}
