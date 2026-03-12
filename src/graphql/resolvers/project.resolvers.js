import Project from '../../models/Project.js';
import User from '../../models/User.js';
import { GraphQLError } from 'graphql';

const gqlError = (message, code, status = 400) => {
  throw new GraphQLError(message, {
    extensions: { code, http: { status } },
  });
};

export const projectResolvers = {
  Query: {
    projects: async (_, { categoria, destaque, page = 1, limit = 9 }) => {
      const filter = { ativo: true };
      if (categoria) filter.categorias = { $in: [categoria] };
      if (destaque !== undefined) filter.destaque = destaque;

      const skip = (page - 1) * limit;
      const [docs, total] = await Promise.all([
        Project.find(filter).populate('criadoPor').skip(skip).limit(limit).sort('-createdAt'),
        Project.countDocuments(filter),
      ]);

      return { docs, total, page, pages: Math.ceil(total / limit) };
    },

    project: async (_, { id }) => {
      const proj = await Project.findById(id).populate('criadoPor');
      if (!proj || !proj.ativo) gqlError('Projeto não encontrado', 'NOT_FOUND', 404);
      return proj;
    },
  },

  Mutation: {
    createProject: async (_, { input }, { user }) => {
      if (!user || user.role !== 'admin') gqlError('Acesso negado', 'FORBIDDEN', 403);
      return Project.create({ ...input, criadoPor: user.id });
    },

    updateProject: async (_, { id, input }, { user }) => {
      if (!user || user.role !== 'admin') gqlError('Acesso negado', 'FORBIDDEN', 403);
      const proj = await Project.findByIdAndUpdate(id, input, { new: true, runValidators: true })
        .populate('criadoPor');
      if (!proj) gqlError('Projeto não encontrado', 'NOT_FOUND', 404);
      return proj;
    },

    deleteProject: async (_, { id }, { user }) => {
      if (!user || user.role !== 'admin') gqlError('Acesso negado', 'FORBIDDEN', 403);
      const proj = await Project.findByIdAndUpdate(id, { ativo: false }, { new: true });
      if (!proj) gqlError('Projeto não encontrado', 'NOT_FOUND', 404);
      return true;
    },
  },

  Project: {
    criadoPor: async (parent) => {
      if (parent.criadoPor && typeof parent.criadoPor === 'object' && parent.criadoPor._id) {
        return parent.criadoPor;
      }
      return User.findById(parent.criadoPor);
    },
  },
};
