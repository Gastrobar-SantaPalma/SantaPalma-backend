import productoRepository from '../repositories/producto.repository.js'
import pedidoRepository from '../repositories/pedido.repository.js'
import supabase from '../config/supabaseClient.js'
import crypto from 'crypto'

class ProductoService {
  
  async getProductos(filters) {
    // Validate category existence if provided
    if (filters.category) {
      const { data: catData, error } = await supabase
        .from('categorias')
        .select('id_categoria')
        .eq('id_categoria', filters.category)
        .limit(1)
      
      if (error) throw new Error('Error verificando categoría')
      if (!catData || catData.length === 0) throw new Error('Categoría no encontrada')
    }

    const { data, count, page, limit } = await productoRepository.findAll(filters)
    const totalPages = Math.ceil((count || 0) / limit) || 0

    return { page, limit, total: count || 0, totalPages, products: data }
  }

  async getProductoById(id) {
    const producto = await productoRepository.findById(id)
    if (!producto) throw new Error('Producto no encontrado')

    // Fetch last 5 comments
    try {
      const { data: comments } = await productoRepository.getComments(id, { limit: 5 })
      producto.comentarios = comments || []
    } catch (e) {
      producto.comentarios = []
    }

    return producto
  }

  async createProducto(data, file) {
    const { nombre, descripcion, precio, id_categoria, disponible } = data
    let imagen_url = data.imagen_url

    // Handle Image Upload
    if (file) {
      imagen_url = await this._uploadImage(file)
    }

    // Validate duplicates
    const existing = await productoRepository.findByNameAndCategory(nombre, id_categoria)
    if (existing && existing.length > 0) {
      throw new Error('Ya existe un producto con ese nombre en la categoría')
    }

    const newProduct = await productoRepository.create({
      nombre,
      descripcion,
      precio,
      id_categoria,
      disponible,
      imagen_url
    })

    return newProduct
  }

  async updateProducto(id, data, file) {
    const { nombre, descripcion, precio, id_categoria, disponible } = data
    let imagen_url = data.imagen_url

    // Handle Image Upload
    if (file) {
      imagen_url = await this._uploadImage(file)
      
      // Try to delete old image
      const existingProduct = await productoRepository.findById(id)
      if (existingProduct && existingProduct.imagen_url) {
        await this._deleteImage(existingProduct.imagen_url)
      }
    }

    // Validate duplicates
    if (nombre) {
      const dup = await productoRepository.findByNameExcludingId(nombre, id)
      if (dup && dup.length > 0) throw new Error('Ya existe un producto con ese nombre')
    }

    const updates = { nombre, descripcion, precio, id_categoria, disponible }
    if (imagen_url !== undefined) updates.imagen_url = imagen_url

    const updatedProduct = await productoRepository.update(id, updates)
    return updatedProduct
  }

  async deleteProducto(id) {
    // Try to delete image first
    const existing = await productoRepository.findById(id)
    if (existing && existing.imagen_url) {
      await this._deleteImage(existing.imagen_url)
    }

    return await productoRepository.delete(id)
  }

  async rateProduct(productId, userId, { puntuacion, comentario }) {
    // Validate Purchase
    const orders = await pedidoRepository.findByClienteId(userId)
    const paidOrders = orders.filter(o => o.pago === 'pagado')
    
    const validOrder = paidOrders.find(order => {
      if (!Array.isArray(order.items)) return false
      return order.items.some(item => Number(item.id_producto) === Number(productId))
    })

    if (!validOrder) {
      throw new Error('Debes comprar y pagar el producto para calificarlo')
    }

    if (puntuacion < 1 || puntuacion > 5) {
      throw new Error('Puntuación inválida: debe ser entre 1 y 5')
    }

    return await productoRepository.upsertRating({
      id_producto: productId,
      id_usuario: userId,
      id_pedido: validOrder.id_pedido,
      puntuacion,
      comentario
    })
  }

  async getProductComments(productId, pagination) {
    const { data, count, page, limit } = await productoRepository.getComments(productId, pagination)
    const totalPages = Math.ceil((count || 0) / limit) || 0
    return { page, limit, total: count || 0, totalPages, comments: data }
  }

  // --- Private Helpers ---

  async _uploadImage(file) {
    const bucket = process.env.PRODUCT_IMAGES_BUCKET || 'product-images'
    const original = file.originalname || 'image'
    const safeName = original.replace(/[^a-zA-Z0-9_.-]/g, '_')
    const filename = `productos/${Date.now()}-${crypto.randomBytes(6).toString('hex')}-${safeName}`

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filename, file.buffer, { contentType: file.mimetype })

    if (error) throw new Error('Error subiendo imagen')

    const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
    return data?.publicUrl || null
  }

  async _deleteImage(publicUrl) {
    try {
      const bucket = process.env.PRODUCT_IMAGES_BUCKET || 'product-images'
      const marker = `/storage/v1/object/public/${bucket}/`
      const idx = publicUrl.indexOf(marker)
      if (idx === -1) return

      const path = publicUrl.substring(idx + marker.length)
      await supabase.storage.from(bucket).remove([path])
    } catch (e) {
      console.warn('Error eliminando imagen:', e)
    }
  }
}

export default new ProductoService()
