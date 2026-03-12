import Joi from 'joi';

export const registerSchema = Joi.object({
  nomeCompleto: Joi.string().trim().max(120).required()
    .messages({
      'string.empty': 'Nome completo é obrigatório',
      'string.max': 'Nome deve ter no máximo 120 caracteres',
    }),
  email: Joi.string().email().lowercase().required()
    .messages({
      'string.email': 'Email inválido',
      'string.empty': 'Email é obrigatório',
    }),
  senha: Joi.string().min(8).max(72).required()
    .messages({
      'string.min': 'Senha deve ter no mínimo 8 caracteres',
      'string.empty': 'Senha é obrigatória',
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().required()
    .messages({ 'string.empty': 'Email é obrigatório' }),
  senha: Joi.string().required()
    .messages({ 'string.empty': 'Senha é obrigatória' }),
});

export const updateMeSchema = Joi.object({
  nomeCompleto: Joi.string().trim().max(120)
    .messages({ 'string.max': 'Nome deve ter no máximo 120 caracteres' }),
});
