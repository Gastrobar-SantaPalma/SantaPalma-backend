import categoriaRepository from '../repositories/categoria.repository.js'

/**
 * Servicio para la lógica de negocio de Categorías.
 */
class CategoriaService {
  /**
   * Obtiene todas las categorías.
   * @returns {Promise<Array<Object>>} Lista de categorías.
   */
  async getCategorias() {
    return await categoriaRepository.findAll()
  }

  /**
   * Obtiene una categoría por ID.
   * @param {number} id - ID de la categoría.
   * @returns {Promise<Object>} La categoría encontrada.
   * @throws {Error} Si la categoría no existe.
   */
  async getCategoriaById(id) {
    const categoria = await categoriaRepository.findById(id)
    if (!categoria) throw new Error('Categoria no encontrada')
    return categoria
  }

  /**
   * Crea una nueva categoría.
   * @param {Object} data - Datos de la categoría.
   * @returns {Promise<Object>} La categoría creada.
   * @throws {Error} Si el nombre ya existe.
   */
  async createCategoria(data) {
    const { nombre, descripcion, activo = true } = data

    // Validar duplicados
    const existing = await categoriaRepository.findByName(nombre)
    if (existing && existing.length > 0) {
      throw new Error('Ya existe una categoría con ese nombre')
    }

    return await categoriaRepository.create({ nombre, descripcion, activo })
  }

  /**
   * Actualiza una categoría.
   * @param {number} id - ID de la categoría.
   * @param {Object} data - Datos a actualizar.
   * @returns {Promise<Object>} La categoría actualizada.
   * @throws {Error} Si la categoría no existe o el nombre está duplicado.
   */
  async updateCategoria(id, data) {
    const { nombre, descripcion, activo } = data

    // Verificar existencia
    const existingCat = await categoriaRepository.findById(id)
    if (!existingCat) throw new Error('Categoria no encontrada')

    // Validar duplicados si cambia el nombre
    if (nombre) {
      const dup = await categoriaRepository.findByNameExcludingId(nombre, id)
      if (dup && dup.length > 0) {
        throw new Error('Ya existe una categoría con ese nombre')
      }
    }

    const updates = { nombre, descripcion, activo }
    // Filtrar undefined
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key])

    return await categoriaRepository.update(id, updates)
  }

  /**
   * Elimina una categoría.
   * @param {number} id - ID de la categoría.
   * @returns {Promise<void>}
   */
  async deleteCategoria(id) {
    // Podríamos agregar validación aquí para no borrar categorías con productos asociados
    // pero por ahora mantenemos la lógica original.
    await categoriaRepository.delete(id)
  }
}

export default new CategoriaService()
