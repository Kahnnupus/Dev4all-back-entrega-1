export const teamTypeDefs = `#graphql
  type TeamMember {
    id: ID!
    nome: String!
    cargo: String!
    bio: String
    fotoUrl: String
    linkedinUrl: String
    githubUrl: String
    ordem: Int!
    ativo: Boolean!
  }

  input CreateTeamMemberInput {
    nome: String!
    cargo: String!
    bio: String
    fotoUrl: String
    linkedinUrl: String
    githubUrl: String
    ordem: Int
  }

  input UpdateTeamMemberInput {
    nome: String
    cargo: String
    bio: String
    fotoUrl: String
    linkedinUrl: String
    githubUrl: String
    ordem: Int
    ativo: Boolean
  }
`;
