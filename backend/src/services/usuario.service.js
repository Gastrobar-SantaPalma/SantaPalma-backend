import usuarioRepository from '../repositories/usuario.repository.js'
import bcrypt from 'bcryptjs'

/**
 * Servicio para la lógica de negocio de Usuarios.
 */
class UsuarioService {
  /**
   * Obtiene todos los usuarios.
   * @returns {Promise<Array<Object>>} Lista de usuarios.
   */
  async getUsuarios() {
    return await usuarioRepository.findAll()
  }

  /**
   * Obtiene un usuario por ID.
   * @param {number} id - ID del usuario.
   * @returns {Promise<Object>} El usuario encontrado.
   * @throws {Error} Si el usuario no existe.
   */
  async getUsuarioById(id) {
    const usuario = await usuarioRepository.findById(id)
    if (!usuario) throw new Error('Usuario no encontrado')
    return usuario
  }

  /**
   * Crea un nuevo usuario.
   * @param {Object} data - Datos del usuario.
   * @returns {Promise<Object>} El usuario creado.
   * @throws {Error} Si el correo ya existe.
   */
  async createUsuario(data) {
    const { nombre, correo, contrasena, rol } = data

    // Validar duplicados
    const existing = await usuarioRepository.findByEmail(correo)
    if (existing) {
      throw new Error('El correo ya está registrado')
    }

    // Hashear contraseña
    const contrasena_hash = await bcrypt.hash(contrasena, 10)
    const fecha_registro = new Date().toISOString()

    return await usuarioRepository.create({
      nombre,
      correo,
      contrasena_hash,
      rol,
      fecha_registro
    })
  }

  /**
   * Actualiza un usuario.
   * @param {number} id - ID del usuario.
   * @param {Object} data - Datos a actualizar.
   * @returns {Promise<Object>} El usuario actualizado.
   * @throws {Error} Si el usuario no existe o el correo ya está en uso.
   */
  async updateUsuario(id, data) {
    const { nombre, correo, contrasena, rol } = data

    // Verificar existencia
    const existingUser = await usuarioRepository.findById(id)
    if (!existingUser) throw new Error('Usuario no encontrado')

    // Validar duplicados si cambia el correo
    if (correo && correo !== existingUser.correo) {
      const dup = await usuarioRepository.findByEmail(correo)
      if (dup) {
        throw new Error('El correo ya está registrado')
      }
    }

    const updates = { nombre, correo, rol }
    
    // Hashear nueva contraseña si se proporciona
    if (contrasena) {
      updates.contrasena_hash = await bcrypt.hash(contrasena, 10)
    }

    // Filtrar undefined
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key])

    return await usuarioRepository.update(id, updates)
  }

  /**
   * Elimina un usuario.
   * @param {number} id - ID del usuario.
   * @returns {Promise<void>}
   */
  async deleteUsuario(id) {
    await usuarioRepository.delete(id)
  }

  /**
   * Autentica un usuario.
   * @param {string} correo - Correo del usuario.
   * @param {string} contrasena - Contraseña en texto plano.
   * @returns {Promise<Object>} El usuario autenticado (sin hash).
   * @throws {Error} Si las credenciales son inválidas.
   */
  async authenticateUsuario(correo, contrasena) {
    const usuario = await usuarioRepository.findByEmail(correo)
    if (!usuario) {
      throw new Error('Credenciales inválidas')
    }

    const match = await bcrypt.compare(contrasena, usuario.contrasena_hash)
    if (!match) {
      throw new Error('Credenciales inválidas')
    }

    // Eliminar hash antes de retornar
    const { contrasena_hash, ...userWithoutHash } = usuario
    return userWithoutHash
  }
}

export default new UsuarioService()
