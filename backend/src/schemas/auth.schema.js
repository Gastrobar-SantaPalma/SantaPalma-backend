import Joi from 'joi'

export const signupSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required().messages({
    'string.base': 'El nombre debe ser un texto',
    'string.empty': 'El nombre no puede estar vacío',
    'string.min': 'El nombre debe tener al menos 3 caracteres',
    'string.max': 'El nombre no puede tener más de 100 caracteres',
    'any.required': 'El nombre es obligatorio'
  }),
  correo: Joi.string().email().required().messages({
    'string.base': 'El correo debe ser un texto',
    'string.email': 'El correo debe ser válido',
    'any.required': 'El correo es obligatorio'
  }),
  contrasena: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>/?]).{8,}$'))
    .required()
    .messages({
      'string.base': 'La contraseña debe ser un texto',
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.pattern.base': 'La contraseña debe tener al menos 1 mayúscula, 1 número y 1 símbolo',
      'any.required': 'La contraseña es obligatoria'
    })
})

export const loginSchema = Joi.object({
  correo: Joi.string().email().required().messages({
    'string.base': 'El correo debe ser un texto',
    'string.email': 'El correo debe ser válido',
    'any.required': 'El correo es obligatorio'
  }),
  contrasena: Joi.string().required().messages({
    'string.base': 'La contraseña debe ser un texto',
    'any.required': 'La contraseña es obligatoria'
  })
})
