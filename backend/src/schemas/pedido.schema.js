import Joi from 'joi'

export const createPedidoSchema = Joi.object({
  id_cliente: Joi.number().integer().positive().allow(null),
  id_mesa: Joi.number().integer().positive().allow(null),
  items: Joi.array().items(
    Joi.object({
      id_producto: Joi.number().integer().positive().required(),
      cantidad: Joi.number().integer().positive().required(),
      notas: Joi.string().allow('', null)
    }).unknown(true) // Allow other props like nombre/precio if passed, though they are ignored/overwritten
  ).min(1).required(),
  total: Joi.number().positive().optional()
}).or('id_cliente', 'id_mesa')

export const updatePedidoSchema = Joi.object({
  id_cliente: Joi.number().integer().positive().allow(null),
  id_mesa: Joi.number().integer().positive().allow(null),
  estado: Joi.string().valid('pendiente', 'preparando', 'listo', 'entregado', 'cancelado'),
  pago: Joi.string().valid('pagado', 'no_pagado'),
  items: Joi.array().items(
    Joi.object({
      id_producto: Joi.number().integer().positive().required(),
      cantidad: Joi.number().integer().positive().required(),
      notas: Joi.string().allow('', null)
    }).unknown(true)
  ).min(1),
  total: Joi.number().positive()
})
