import Joi from 'joi'

export const createPagoSchema = Joi.object({
  id_pedido: Joi.number().integer().required().messages({
    'number.base': 'El id_pedido debe ser un número',
    'any.required': 'El id_pedido es requerido'
  })
})
