export const userTypeDefs = `#graphql
  type User {
    id: ID!
    nomeCompleto: String!
    email: String!
    role: Role!
    ativo: Boolean!
    createdAt: String!
    quotes: [Quote!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    nomeCompleto: String!
    email: String!
    senha: String!
  }

  input LoginInput {
    email: String!
    senha: String!
  }
`;
