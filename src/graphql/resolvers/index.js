import { userResolvers } from './user.resolvers.js';
import { projectResolvers } from './project.resolvers.js';
import { quoteResolvers } from './quote.resolvers.js';
import { teamResolvers } from './team.resolvers.js';

// Merge manual dos resolvers (sem lodash.merge para manter dependências mínimas)
export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...projectResolvers.Query,
    ...quoteResolvers.Query,
    ...teamResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...projectResolvers.Mutation,
    ...quoteResolvers.Mutation,
    ...teamResolvers.Mutation,
  },
  // Field resolvers por tipo
  User: userResolvers.User,
  Project: projectResolvers.Project,
  Quote: quoteResolvers.Quote,
};
