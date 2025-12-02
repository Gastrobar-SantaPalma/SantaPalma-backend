import calificacionesService from '../services/calificaciones.service.js'

export const crearCalificacion = async (req, res) => {
  try {
    const calificacion = await calificacionesService.crearCalificacion(req.body)
    res.status(201).json({ message: 'Calificación guardada con éxito', calificacion })
  } catch (err) {
    console.error('Error guardando calificación:', err)
    res.status(400).json({ error: err.message })
  }
}

export const obtenerCalificaciones = async (req, res) => {
  try {
    const { id_producto } = req.params
    const result = await calificacionesService.obtenerCalificaciones(id_producto)
    res.json(result)
  } catch (err) {
    console.error('Error obteniendo calificaciones:', err)
    res.status(500).json({ error: 'Error en el servidor' })
  }
}
