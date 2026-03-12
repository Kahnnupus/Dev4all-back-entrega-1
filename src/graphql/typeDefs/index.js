import { userTypeDefs } from './user.typeDefs.js';
import { projectTypeDefs } from './project.typeDefs.js';
import { quoteTypeDefs } from './quote.typeDefs.js';
import { teamTypeDefs } from './team.typeDefs.js';


const baseTypeDefs = `#graphql
  enum Role {
    user
    admin
  }

  type Query {
    
    me: User

    
    projects(categoria: String, destaque: Boolean, page: Int, limit: Int): ProjectPage!
    project(id: ID!): Project

    
    quotes(status: String, page: Int, limit: Int): QuotePage!
    myQuotes: [Quote!]!

    
    teamMembers: [TeamMember!]!

    
    users(page: Int, limit: Int): [User!]!
  }

  type Mutation {
    
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    
    createProject(input: CreateProjectInput!): Project!
    updateProject(id: ID!, input: UpdateProjectInput!): Project!
    deleteProject(id: ID!): Boolean!

    
    submitQuote(input: CreateQuoteInput!): Quote!
    updateQuoteStatus(id: ID!, status: String!): Quote!
    deleteQuote(id: ID!): Boolean!

    
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
