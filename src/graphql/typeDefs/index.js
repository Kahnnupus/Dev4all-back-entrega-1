import { userTypeDefs } from './user.typeDefs.js';
import { projectTypeDefs } from './project.typeDefs.js';
import { quoteTypeDefs } from './quote.typeDefs.js';
import { teamTypeDefs } from './team.typeDefs.js';

// SDL base: enums compartilhados + Query + Mutation raiz
const baseTypeDefs = `#graphql
  enum Role {
    user
    admin
  }

  type Query {
    # User
    me: User

    # Projects
    projects(categoria: String, destaque: Boolean, page: Int, limit: Int): ProjectPage!
    project(id: ID!): Project

    # Quotes
    quotes(status: String, page: Int, limit: Int): QuotePage!
    myQuotes: [Quote!]!

    # Team
    teamMembers: [TeamMember!]!

    # Admin
    users(page: Int, limit: Int): [User!]!
  }

  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Projects
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!

    # Quotes
    submitQuote(input: CreateQuoteInput!): Quote!
    updateQuoteStatus(id: ID!, status: String!): Quote!
    deleteQuote(id: ID!): Boolean!

    # Team
    createTeamMember(input: CreateTeamMemberInput!): TeamMember!
    updateTeamMember(id: ID!, input: UpdateTeamMemberInput!): TeamMember!
    deleteTeamMember(id: ID!): Boolean!
  }
`;

export const typeDefs = [
  baseTypeDefs,
  userTypeDefs,
  projectTypeDefs,
  quoteTypeDefs,
  teamTypeDefs,
];
