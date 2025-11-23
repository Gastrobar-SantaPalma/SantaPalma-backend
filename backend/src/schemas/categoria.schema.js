import Joi from 'joi'

/**
 * Esquema de validación para la creación de categorías.
 */
export const createCategoriaSchema = Joi.object({
  nombre: Joi.string().min(3).max(50).required().messages({
    'string.base': 'El nombre debe ser un texto',
    'string.empty': 'El nombre no puede estar vacío',
    'string.min': 'El nombre debe tener al menos 3 caracteres',
    'string.max': 'El nombre no puede tener más de 50 caracteres',
    'any.required': 'El nombre es obligatorio'
  }),
  descripcion: Joi.string().allow('', null).max(255).messages({
    'string.base': 'La descripción debe ser un texto',
    'string.max': 'La descripción no puede tener más de 255 caracteres'
  }),
  activo: Joi.boolean().optional().messages({
    'boolean.base': 'El campo activo debe ser un valor booleano'
  })
})

/**
 * Esquema de validación para la actualización de categorías.
 */
export const updateCategoriaSchema = Joi.object({
  nombre: Joi.string().min(3).max(50).optional().messages({
    'string.base': 'El nombre debe ser un texto',
    'string.empty': 'El nombre no puede estar vacío',
    'string.min': 'El nombre debe tener al menos 3 caracteres',
    'string.max': 'El nombre no puede tener más de 50 caracteres'
  }),
  descripcion: Joi.string().allow('', null).max(255).optional().messages({
    'string.base': 'La descripción debe ser un texto',
    'string.max': 'La descripción no puede tener más de 255 caracteres'
  }),
  activo: Joi.boolean().optional().messages({
    'boolean.base': 'El campo activo debe ser un valor booleano'
  })
})
