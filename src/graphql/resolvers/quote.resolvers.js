import Quote from '../../models/Quote.js';
import User from '../../models/User.js';
import { GraphQLError } from 'graphql';

const gqlError = (message, code, status = 400) => {
  throw new GraphQLError(message, {
    extensions: { code, http: { status } },
  });
};

const VALID_STATUSES = ['pendente', 'em_analise', 'aprovado', 'rejeitado'];

export const quoteResolvers = {
  Query: {
    quotes: async (_, { status, page = 1, limit = 20 }, { user }) => {
      if (!user || user.role !== 'admin') gqlError('Acesso negado', 'FORBIDDEN', 403);

      const filter = {};
      if (status) filter.status = status;

      const skip = (page - 1) * limit;
      const [docs, total] = await Promise.all([
        Quote.find(filter).populate('usuario').skip(skip).limit(limit).sort('-createdAt'),
        Quote.countDocuments(filter),
      ]);

      return { docs, total, page, pages: Math.ceil(total / limit) };
    },

    myQuotes: async (_, __, { user }) => {
      if (!user) gqlError('Não autenticado', 'UNAUTHENTICATED', 401);
      return Quote.find({ usuario: user.id }).sort('-createdAt');
    },
  },

  Mutation: {
    submitQuote: async (_, { input }, { user }) => {
      const quoteData = { ...input };
      if (user) quoteData.usuario = user.id;
      return Quote.create(quoteData);
    },

    updateQuoteStatus: async (_, { id, status }, { user }) => {
      if (!user || user.role !== 'admin') gqlError('Acesso negado', 'FORBIDDEN', 403);
      if (!VALID_STATUSES.includes(status)) {
        gqlError(`Status inválido. Use: ${VALID_STATUSES.join(', ')}`, 'BAD_USER_INPUT');
      }
      const quote = await Quote.findByIdAndUpdate(id, { status }, { new: true }).populate('usuario');
      if (!quote) gqlError('Orçamento não encontrado', 'NOT_FOUND', 404);
      return quote;
    },

    deleteQuote: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin') gqlError('Acesso negado', 'FORBIDDEN', 403);
      const quote = await Quote.findByIdAndDelete(id);
      if (!quote) gqlError('Orçamento não encontrado', 'NOT_FOUND', 404);
      return true;
    },
  },

  Quote: {
    usuario: async (parent) => {
      if (!parent.usuario) return null;
      if (typeof parent.usuario === 'object' && parent.usuario._id) return parent.usuario;
      return User.findById(parent.usuario);
    },
  },
};
