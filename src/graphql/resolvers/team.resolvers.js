import TeamMember from '../../models/TeamMember.js';
import { GraphQLError } from 'graphql';

const gqlError = (message, code, status = 400) => {
  throw new GraphQLError(message, {
    extensions: { code, http: { status } },
  });
};

export const teamResolvers = {
  Query: {
    teamMembers: async () => {
      return TeamMember.find({ ativo: true }).sort('ordem');
    },
  },

  Mutation: {
    createTeamMember: async (_, { input }, { user }) => {
      if (!user || user.role !== 'admin') gqlError('Acesso negado', 'FORBIDDEN', 403);
      return TeamMember.create(input);
    },

    updateTeamMember: async (_, { id, input }, { user }) => {
      if (!user || user.role !== 'admin') gqlError('Acesso negado', 'FORBIDDEN', 403);
      const member = await TeamMember.findByIdAndUpdate(id, input, { new: true, runValidators: true });
      if (!member) gqlError('Membro não encontrado', 'NOT_FOUND', 404);
      return member;
    },

    deleteTeamMember: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin') gqlError('Acesso negado', 'FORBIDDEN', 403);
      const member = await TeamMember.findByIdAndUpdate(id, { ativo: false }, { new: true });
      if (!member) gqlError('Membro não encontrado', 'NOT_FOUND', 404);
      return true;
    },
  },
};
