export const projectTypeDefs = `#graphql
  type Project {
    id: ID!
    titulo: String!
    descricao: String!
    categorias: [String!]!
    imagemUrl: String
    linkExterno: String
    destaque: Boolean!
    ativo: Boolean!
    criadoPor: User!
    createdAt: String!
    updatedAt: String!
  }

  type ProjectPage {
    docs: [Project!]!
    total: Int!
    page: Int!
    pages: Int!
  }

  input CreateProjectInput {
    titulo: String!
    descricao: String!
    categorias: [String!]!
    imagemUrl: String
    linkExterno: String
    destaque: Boolean
  }

  input UpdateProjectInput {
    titulo: String
    descricao: String
    categorias: [String!]
    imagemUrl: String
    linkExterno: String
    destaque: Boolean
    ativo: Boolean
  }
`;
