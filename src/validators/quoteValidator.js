import Joi from 'joi';

const TIPOS_SERVICO = ['Consultoria', 'Desenvolvimento', 'Design', 'Marketing', 'Outro'];

export const createQuoteSchema = Joi.object({
  nomeCompleto: Joi.string().trim().max(120).required()
    .messages({ 'string.empty': 'Nome é obrigatório' }),
  email: Joi.string().email().lowercase().required()
    .messages({ 'string.email': 'Email inválido', 'string.empty': 'Email é obrigatório' }),
  telefone: Joi.string().trim().max(20).required()
    .messages({ 'string.empty': 'Telefone é obrigatório' }),
  tipoServico: Joi.array()
    .items(Joi.string().valid(...TIPOS_SERVICO))
    .min(1)
    .required()
    .messages({
      'array.min': 'Selecione ao menos um tipo de serviço',
      'any.only': 'Tipo de serviço inválido',
    }),
  descricao: Joi.string().max(3000).required()
    .messages({ 'string.empty': 'Descrição do projeto é obrigatória' }),
});

export const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid('pendente', 'em_analise', 'aprovado', 'rejeitado')
    .required()
    .messages({
      'any.only': 'Status inválido. Use: pendente, em_analise, aprovado ou rejeitado',
    }),
});
