import productoService from '../services/producto.service.js'

// Obtener todos los productos (incluye datos de la categoría)
export const getProductos = async (req, res) => {
  try {
    const { page, limit, category, search } = req.query
    const result = await productoService.getProductos({ page, limit, category, search })
    res.status(200).json(result)
  } catch (err) {
    console.error('Error en getProductos:', err)
    if (err.message === 'Categoría no encontrada') {
      return res.status(404).json({ error: err.message })
    }
    res.status(500).json({ error: err.message || 'Error interno' })
  }
}

// Obtener un producto por ID
export const getProductoById = async (req, res) => {
  const { id } = req.params
  try {
    const producto = await productoService.getProductoById(id)
    res.status(200).json(producto)
  } catch (err) {
    console.error('Error en getProductoById:', err)
    if (err.message === 'Producto no encontrado') {
      return res.status(404).json({ error: err.message })
    }
    res.status(500).json({ error: err.message || 'Error interno' })
  }
}

// Crear un nuevo producto
export const createProducto = async (req, res) => {
  try {
    // req.body is already validated by middleware, but file handling is manual
    const newProduct = await productoService.createProducto(req.body, req.file)
    res.status(201).json(newProduct)
  } catch (err) {
    console.error('Error al crear producto:', err)
    if (err.message.includes('Ya existe')) {
      return res.status(409).json({ error: err.message })
    }
    if (err.message.includes('requerido') || err.message.includes('inválido')) {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: err.message || 'Error interno' })
  }
}

// Actualizar un producto existente
export const updateProducto = async (req, res) => {
  const { id } = req.params
  try {
    const updatedProduct = await productoService.updateProducto(id, req.body, req.file)
    res.status(200).json(updatedProduct)
  } catch (err) {
    console.error('Error al actualizar producto:', err)
    if (err.message.includes('Ya existe')) {
      return res.status(409).json({ error: err.message })
    }
    res.status(500).json({ error: err.message || 'Error interno' })
  }
}

// Eliminar un producto
export const deleteProducto = async (req, res) => {
  const { id } = req.params
  try {
    await productoService.deleteProducto(id)
    res.status(204).send()
  } catch (err) {
    console.error('Error al eliminar producto:', err)
    res.status(500).json({ error: err.message || 'Error interno' })
  }
}

// Calificar un producto
export const rateProduct = async (req, res) => {
  const { id } = req.params
  const id_usuario = req.user.id
  
  try {
    const result = await productoService.rateProduct(id, id_usuario, req.body)
    res.status(200).json(result)
  } catch (err) {
    console.error('Error in rateProduct:', err)
    if (err.message === 'Debes comprar y pagar el producto para calificarlo') {
      return res.status(403).json({ error: err.message })
    }
    if (err.message.includes('Puntuación inválida')) {
      return res.status(400).json({ error: err.message })
    }
    if (err.message === 'Producto no encontrado') {
      return res.status(404).json({ error: err.message })
    }
    res.status(500).json({ error: err.message || 'Error interno' })
  }
}

// Obtener comentarios paginados
export const getProductComments = async (req, res) => {
  const { id } = req.params
  const { page, limit } = req.query
  
  try {
    const result = await productoService.getProductComments(id, { page, limit })
    res.status(200).json(result)
  } catch (err) {
    console.error('Error in getProductComments:', err)
    res.status(500).json({ error: err.message || 'Error interno' })
  }
}

