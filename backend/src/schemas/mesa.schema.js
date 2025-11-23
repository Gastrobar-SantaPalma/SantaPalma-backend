import Joi from 'joi'

/**
 * Esquema de validación para la creación de mesas.
 */
export const createMesaSchema = Joi.object({
  id_mesa: Joi.number().integer().positive().optional().messages({
    'number.base': 'El ID de la mesa debe ser un número',
    'number.integer': 'El ID de la mesa debe ser un entero',
    'number.positive': 'El ID de la mesa debe ser positivo'
  }),
  estado: Joi.string().valid('libre', 'ocupada', 'reservada', 'mantenimiento').optional().messages({
    'string.base': 'El estado debe ser un texto',
    'any.only': 'El estado debe ser uno de: libre, ocupada, reservada, mantenimiento'
  }),
  ubicacion: Joi.string().allow('', null).max(100).optional().messages({
    'string.base': 'La ubicación debe ser un texto',
    'string.max': 'La ubicación no puede tener más de 100 caracteres'
  }),
  // Permitir codigo_qr pero ignorarlo (strip) para compatibilidad
  codigo_qr: Joi.any().strip()
})

/**
 * Esquema de validación para la actualización de mesas.
 */
export const updateMesaSchema = Joi.object({
  estado: Joi.string().valid('libre', 'ocupada', 'reservada', 'mantenimiento').optional().messages({
    'string.base': 'El estado debe ser un texto',
    'any.only': 'El estado debe ser uno de: libre, ocupada, reservada, mantenimiento'
  }),
  ubicacion: Joi.string().allow('', null).max(100).optional().messages({
    'string.base': 'La ubicación debe ser un texto',
    'string.max': 'La ubicación no puede tener más de 100 caracteres'
  })
})
