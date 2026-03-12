import Joi from 'joi';

const CATEGORIAS = ['Consultoria', 'Desenvolvimento', 'Design', 'Marketing', 'Outro'];

export const createProjectSchema = Joi.object({
  titulo: Joi.string().trim().max(200).required()
    .messages({ 'string.empty': 'Título é obrigatório' }),
  descricao: Joi.string().max(2000).required()
    .messages({ 'string.empty': 'Descrição é obrigatória' }),
  categorias: Joi.array()
    .items(Joi.string().valid(...CATEGORIAS))
    .default([]),
  imagemUrl: Joi.string().uri().allow(null, '').default(null),
  linkExterno: Joi.string().uri().allow(null, '').default(null),
  destaque: Joi.boolean().default(false),
});

export const updateProjectSchema = Joi.object({
  titulo: Joi.string().trim().max(200),
  descricao: Joi.string().max(2000),
  categorias: Joi.array().items(Joi.string().valid(...CATEGORIAS)),
  imagemUrl: Joi.string().uri().allow(null, ''),
  linkExterno: Joi.string().uri().allow(null, ''),
  destaque: Joi.boolean(),
  ativo: Joi.boolean(),
});
