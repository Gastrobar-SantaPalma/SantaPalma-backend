import categoriaService from '../services/categoria.service.js'

/**
 * Controlador para gestionar las categorías.
 */
export const getCategorias = async (req, res) => {
  try {
    const categorias = await categoriaService.getCategorias()
    res.json(categorias)
  } catch (error) {
    console.error('Error al obtener categorías:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const getCategoriaById = async (req, res) => {
  const { id } = req.params
  try {
    const categoria = await categoriaService.getCategoriaById(id)
    res.json(categoria)
  } catch (error) {
    console.error('Error al obtener categoría:', error)
    if (error.message === 'Categoria no encontrada') {
      return res.status(404).json({ error: error.message })
    }
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const createCategoria = async (req, res) => {
  try {
    const nuevaCategoria = await categoriaService.createCategoria(req.body)
    res.status(201).json(nuevaCategoria)
  } catch (error) {
    console.error('Error al crear categoría:', error)
    if (error.message === 'Ya existe una categoría con ese nombre') {
      return res.status(409).json({ error: error.message })
    }
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const updateCategoria = async (req, res) => {
  const { id } = req.params
  try {
    const categoriaActualizada = await categoriaService.updateCategoria(id, req.body)
    res.json(categoriaActualizada)
  } catch (error) {
    console.error('Error al actualizar categoría:', error)
    if (error.message === 'Categoria no encontrada') {
      return res.status(404).json({ error: error.message })
    }
    if (error.message === 'Ya existe una categoría con ese nombre') {
      return res.status(409).json({ error: error.message })
    }
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

export const deleteCategoria = async (req, res) => {
  const { id } = req.params
  try {
    await categoriaService.deleteCategoria(id)
    res.status(204).send()
  } catch (error) {
    console.error('Error al eliminar categoría:', error)
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}
