export const quoteTypeDefs = `#graphql
  type Quote {
    id: ID!
    nomeCompleto: String!
    email: String!
    telefone: String!
    tipoServico: [String!]!
    descricao: String!
    status: String!
    usuario: User
    createdAt: String!
    updatedAt: String!
  }

  type QuotePage {
    docs: [Quote!]!
    total: Int!
    page: Int!
    pages: Int!
  }

  input CreateQuoteInput {
    nomeCompleto: String!
    email: String!
    telefone: String!
    tipoServico: [String!]!
    descricao: String!
  }
`;
