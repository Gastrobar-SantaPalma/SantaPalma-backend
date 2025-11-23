import supabase from '../config/supabaseClient.js'

/**
 * Repositorio para la entidad Categorias.
 * Encapsula todas las interacciones directas con la base de datos Supabase.
 */
class CategoriaRepository {
  /**
   * Obtiene todas las categorías.
   * @returns {Promise<Array<Object>>} Lista de categorías.
   * @throws {Error} Si ocurre un error en la consulta.
   */
  async findAll() {
    const { data, error } = await supabase
      .from('categorias')
      .select(`
        id_categoria,
        nombre,
        descripcion,
        activo
      `)
      .order('nombre', { ascending: true })

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Busca una categoría por su ID.
   * @param {number} id - ID de la categoría.
   * @returns {Promise<Object|null>} La categoría encontrada o null.
   * @throws {Error} Si ocurre un error en la consulta.
   */
  async findById(id) {
    const { data, error } = await supabase
      .from('categorias')
      .select(`
        id_categoria,
        nombre,
        descripcion,
        activo
      `)
      .eq('id_categoria', id)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Busca categorías por nombre (case-insensitive).
   * @param {string} nombre - Nombre a buscar.
   * @returns {Promise<Array<Object>>} Lista de categorías coincidentes.
   * @throws {Error} Si ocurre un error en la consulta.
   */
  async findByName(nombre) {
    const { data, error } = await supabase
      .from('categorias')
      .select('id_categoria')
      .ilike('nombre', nombre)

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Busca categorías por nombre excluyendo un ID específico (para validación de duplicados en update).
   * @param {string} nombre - Nombre a buscar.
   * @param {number} excludeId - ID a excluir de la búsqueda.
   * @returns {Promise<Array<Object>>} Lista de categorías coincidentes.
   * @throws {Error} Si ocurre un error en la consulta.
   */
  async findByNameExcludingId(nombre, excludeId) {
    const { data, error } = await supabase
      .from('categorias')
      .select('id_categoria')
      .ilike('nombre', nombre)
      .neq('id_categoria', excludeId)

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Crea una nueva categoría.
   * @param {Object} categoriaData - Datos de la categoría.
   * @returns {Promise<Object>} La categoría creada.
   * @throws {Error} Si ocurre un error en la inserción.
   */
  async create(categoriaData) {
    const { data, error } = await supabase
      .from('categorias')
      .insert([categoriaData])
      .select(`id_categoria, nombre, descripcion, activo`)
      .single()

    if (error) {
      // Fallback para esquemas antiguos sin columna 'activo'
      if (error.message && error.message.includes("Could not find the 'activo' column")) {
        const { activo, ...fallbackData } = categoriaData
        const { data: fbData, error: fbError } = await supabase
          .from('categorias')
          .insert([fallbackData])
          .select('id_categoria, nombre, descripcion')
          .single()
        
        if (fbError) throw new Error(fbError.message)
        return fbData
      }
      throw new Error(error.message)
    }
    return data
  }

  /**
   * Actualiza una categoría existente.
   * @param {number} id - ID de la categoría.
   * @param {Object} updates - Campos a actualizar.
   * @returns {Promise<Object>} La categoría actualizada.
   * @throws {Error} Si ocurre un error en la actualización.
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('categorias')
      .update(updates)
      .eq('id_categoria', id)
      .select(`id_categoria, nombre, descripcion, activo`)
      .single()

    if (error) throw new Error(error.message)
    return data
  }

  /**
   * Elimina una categoría.
   * @param {number} id - ID de la categoría.
   * @returns {Promise<boolean>} True si se eliminó correctamente.
   * @throws {Error} Si ocurre un error en la eliminación.
   */
  async delete(id) {
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id_categoria', id)

    if (error) throw new Error(error.message)
    return true
  }
}

export default new CategoriaRepository()
