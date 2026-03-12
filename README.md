# Dev4all - Projeto Backend

## Descrição

Dev4all é o projeto de backend para uma agência de desenvolvimento web. O aplicativo fornece uma API RESTful e um endpoint GraphQL para gerenciar usuários, projetos, orçamentos (solicitações de serviços) e membros da equipe.

O sistema utiliza Node.js com Express, MongoDB com Mongoose para persistência de dados, Apollo Server para integração com GraphQL, e JWT para autenticação.

## Membros da Equipe

A equipe de desenvolvimento deste projeto é composta pelos seguintes membros:
- Felipe Albino
- Reuel Vinicius
- nathan feitoza
- Marcos
- Murilo lacerda

## Tecnologias Utilizadas

- Node.js
- Express.js
- MongoDB e Mongoose
- GraphQL (Apollo Server)
- JWT (JSON Web Tokens)
- Bcrypt.js
- Joi (Validação de Dados)
- Helmet e Cors (Segurança)

## Configuração e Instalação

### Pré-requisitos

- Node.js (v18.0.0 ou superior)
- MongoDB rodando localmente ou uma string de conexão do MongoDB Atlas

### Passos

1. Clone o repositório em seu ambiente local.
2. Abra a pasta do projeto em seu terminal.
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as variáveis de ambiente necessárias, como `PORT`, `MONGO_URI`, `JWT_SECRET`, etc.

### Executando a Aplicação

Para iniciar o servidor em modo de produção:
```bash
npm start
```

Para iniciar o servidor em modo de desenvolvimento (com nodemon):
```bash
npm run dev
```

O servidor iniciará na porta configurada (o padrão é 3000).

## Rotas da API

### API REST

A URL base para a API REST é `http://localhost:3000/api`.

- Autenticação: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- Projetos: `/api/projects` (GET, POST), `/api/projects/:id` (GET, PATCH, DELETE)
- Orçamentos: `/api/quotes` (GET, POST), `/api/quotes/:id` (GET, PATCH)
- Equipe: `/api/team` (GET, POST), `/api/team/:id` (GET, PATCH, DELETE)

### GraphQL

O endpoint GraphQL está disponível em `http://localhost:3000/graphql`. Você pode testar consultas (queries) e mutações (mutations) usando o Apollo Sandbox.

## Popular Banco de Dados
Para popular o banco de dados com dados iniciais, você pode rodar o comando:
```bash
npm run seed
```

## Licença
Licença MIT