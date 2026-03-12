import { userResolvers } from './user.resolvers.js';
import { projectResolvers } from './project.resolvers.js';
import { quoteResolvers } from './quote.resolvers.js';
import { teamResolvers } from './team.resolvers.js';


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

  User: userResolvers.User,
  Project: projectResolvers.Project,
  Quote: quoteResolvers.Quote,
};
