import Joi from 'joi'

export const createProductoSchema = Joi.object({
  nombre: Joi.string().required(),
  descripcion: Joi.string().allow('', null),
  precio: Joi.number().positive().required(),
  id_categoria: Joi.number().integer().positive().required(),
  disponible: Joi.boolean().default(true),
  imagen_url: Joi.string().uri().allow(null)
})

export const updateProductoSchema = Joi.object({
  nombre: Joi.string(),
  descripcion: Joi.string().allow('', null),
  precio: Joi.number().positive(),
  id_categoria: Joi.number().integer().positive(),
  disponible: Joi.boolean(),
  imagen_url: Joi.string().uri().allow(null)
})

export const rateProductSchema = Joi.object({
  puntuacion: Joi.number().integer().min(1).max(5).required(),
  comentario: Joi.string().allow('', null)
})
