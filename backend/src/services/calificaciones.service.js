
import calificacionesRepository from '../repositories/calificaciones.repository.js'

class CalificacionesService {
  async crearCalificacion(data) {
    const { id_producto, id_usuario, puntuacion } = data
    if (!id_producto || !id_usuario || !puntuacion) {
      throw new Error('Faltan campos obligatorios')
    }
    return await calificacionesRepository.create(data)
  }

  async obtenerCalificaciones(id_producto) {
    const comentarios = await calificacionesRepository.findByProducto(id_producto)
    const total = comentarios.length
    const promedio =
      comentarios.reduce((acc, x) => acc + Number(x.puntuacion), 0) / (total || 1)

    return { comentarios, total, promedio }
  }
}

export default new CalificacionesService()
