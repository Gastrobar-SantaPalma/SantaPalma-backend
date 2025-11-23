/**
 * Middleware para validar el cuerpo de la solicitud usando un esquema Joi.
 * @param {Object} schema - Esquema de validación Joi.
 * @returns {Function} Middleware de Express.
 */
export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false })
  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ')
    return res.status(400).json({ error: errorMessage })
  }
  next()
}
