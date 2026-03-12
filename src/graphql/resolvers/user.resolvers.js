import User from '../../models/User.js';
import Quote from '../../models/Quote.js';
import { signToken } from '../../config/jwt.js';
import { GraphQLError } from 'graphql';

const gqlError = (message, code, status = 400) => {
  throw new GraphQLError(message, {
    extensions: { code, http: { status } },
  });
};

export const userResolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) gqlError('Não autenticado', 'UNAUTHENTICATED', 401);
      return User.findById(user.id).populate('quotes');
    },

    users: async (_, { page = 1, limit = 20 }, { user }) => {
      if (!user || user.role !== 'admin') {
        gqlError('Acesso negado', 'FORBIDDEN', 403);
      }
      const skip = (page - 1) * limit;
      return User.find({ ativo: true }).skip(skip).limit(limit).populate('quotes');
    },
  },

  Mutation: {
    register: async (_, { input }) => {
      const { nomeCompleto, email, senha } = input;

      const existe = await User.findOne({ email: email.toLowerCase() });
      if (existe) gqlError('Email já cadastrado', 'BAD_USER_INPUT', 409);

      const newUser = await User.create({ nomeCompleto, email, senha });
      const token = signToken(newUser._id, newUser.role);

      return { token, user: newUser };
    },

    login: async (_, { input }) => {
      const { email, senha } = input;

      const foundUser = await User.findOne({ email: email.toLowerCase() }).select('+senha');
      if (!foundUser || !(await foundUser.senhaCorreta(senha))) {
        gqlError('Email ou senha incorretos', 'UNAUTHENTICATED', 401);
      }
      if (!foundUser.ativo) {
        gqlError('Conta desativada', 'FORBIDDEN', 403);
      }

      const token = signToken(foundUser._id, foundUser.role);
      return { token, user: foundUser };
    },
  },

  User: {
    quotes: async (parent) => {
      if (parent.quotes && Array.isArray(parent.quotes) && parent.quotes.length > 0) {
        if (typeof parent.quotes[0] === 'object' && parent.quotes[0]._id) return parent.quotes;
      }
      return Quote.find({ usuario: parent._id || parent.id });
    },
  },
};
