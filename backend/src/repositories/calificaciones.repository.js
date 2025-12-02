import supabase from '../config/supabaseClient.js'

class CalificacionesRepository {
  async create(calificacion) {
    const { data, error } = await supabase
      .from('calificaciones')
      .insert([calificacion])

    if (error) throw error
    return data[0]
  }

  async findByProducto(id_producto) {
    const { data, error } = await supabase
      .from('calificaciones')
      .select('*')
      .eq('id_producto', id_producto)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return data
  }
}

export default new CalificacionesRepository()
