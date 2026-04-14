# Dev4all - API Backend (REST & GraphQL)

Bem-vindo ao repositório do backend da **Dev4all**, uma agência de desenvolvimento web. Este projeto foi construído para fornecer uma infraestrutura robusta e escalável, suportando tanto uma API RESTful tradicional quanto uma interface GraphQL moderna.

O sistema gerencia usuários, projetos de portfólio, solicitações de orçamentos e informações dos membros da equipe.

---

## 🚀 Tecnologias Utilizadas

Este projeto utiliza o que há de mais moderno no ecossistema Node.js:

- **Runtime**: [Node.js](https://nodejs.org/) (versão >= 18.0.0)
- **Framework**: [Express.js](https://expressjs.com/)
- **Banco de Dados**: [MongoDB](https://www.mongodb.com/) com [Mongoose ORM](https://mongoosejs.com/)
- **GraphQL**: [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- **Segurança**: 
  - [JSON Web Tokens (JWT)](https://jwt.io/) para autenticação.
  - [Bcryptjs](https://github.com/dcodeIO/bcrypt.js) para hash de senhas.
  - [Helmet](https://helmetjs.github.io/) para cabeçalhos de segurança HTTP.
  - [Express Rate Limit](https://www.npmjs.com/package/express-rate-limit) para prevenção de abusos.
- **Validação**: [Joi](https://joi.dev/) para validação rigorosa de esquemas de dados.

---

## 🛠️ Passo a Passo para Configuração

Siga as etapas abaixo para rodar o projeto em sua máquina local:

### 1. Pré-requisitos
Certifique-se de ter instalado:
- **Node.js** (v18+)
- **NPM** (vem com o Node)
- **MongoDB** (Rodando localmente ou uma conta no MongoDB Atlas)

### 2. Clonar o Repositório
```bash
git clone https://github.com/Kahnnupus/Dev4all-back-entrega-1
cd Dev4all-back-entrega-1-main
```

### 3. Instalar Dependências

```bash
npm install
```

### 4. Configurar Variáveis de Ambiente

O arquivo `.env` já foi configurado com as credenciais padrão necessárias para o funcionamento local. Caso precise fazer alterações em credenciais específicas do MongoDB Atlas ou chaves JWT, edite o arquivo `.env` na raiz:

- `MONGODB_URI`: String de conexão (Atualmente configurada para MongoDB local).
- `JWT_SECRET`: Chave mestra para tokens (Já configurada com uma chave segura).
- `PORT`: Porta do servidor (Padrão: `3000`).

### 5. Popular o Banco de Dados (Seed)

Para que você não comece com um banco vazio, execute o script de semente (seed) para criar dados de exemplo:

```bash
npm run seed
```
> [!IMPORTANT]
> O comando acima criará um usuário administrador padrão:
> - **E-mail**: `admin@dev4all.com`
> - **Senha**: `admin`

### 6. Iniciar o Servidor
**Modo de Desenvolvimento (com auto-reload):**
```bash
npm run dev
```
**Modo de Produção:**
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`.

---

## 📡 API REST - Endpoints

A API REST está acessível através do prefixo `/api`. Todas as rotas que exigem autenticação devem enviar o cabeçalho: `Authorization: Bearer <seu_token_jwt>`.

### Autenticação (`/api/auth`)

| Método | Endpoint | Descrição | Proteção |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Cadastra um novo usuário | Pública |
| POST | `/login` | Autentica e retorna o Token JWT | Pública |
| GET | `/me` | Retorna os dados do usuário logado | JWT |
| POST | `/forgot-password` | Simula envio de recuperação de senha | Pública |

**Exemplos JSON:**
- **Login/Register**:
  ```json
  {
    "nomeCompleto": "João Silva",
    "email": "joao@exemplo.com",
    "senha": "senha_segura_123"
  }
  ```

### Projetos (`/api/projects`)

| Método | Endpoint | Descrição | Proteção |
| :--- | :--- | :--- | :--- |
| GET | `/` | Lista todos os projetos (filtros via Query) | Pública |
| GET | `/:id` | Detalhes de um projeto específico | Pública |
| POST | `/` | Cria um novo projeto | Admin |
| PATCH | `/:id` | Atualiza um projeto existente | Admin |
| DELETE | `/:id` | Remove (desativa) um projeto | Admin |

**Exemplo JSON (POST/PATCH):**
```json
{
  "titulo": "Novo E-commerce",
  "descricao": "Descrição detalhada do projeto...",
  "categorias": ["Desenvolvimento", "Design"],
  "imagemUrl": "https://link-da-imagem.com",
  "destaque": true
}
```

### Orçamentos (`/api/quotes`)

| Método | Endpoint | Descrição | Proteção |
| :--- | :--- | :--- | :--- |
| POST | `/` | Envia um novo pedido de orçamento | Pública / Opcional JWT |
| GET | `/my` | Lista orçamentos do usuário logado | JWT |
| GET | `/` | Lista todos os orçamentos (para gestão) | Admin |
| PATCH | `/:id/status`| Atualiza status (pendente, aprovado, etc) | Admin |
| DELETE | `/:id` | Remove um orçamento | Admin |

**Exemplo JSON (POST):**
```json
{
  "nomeCompleto": "Maria Souza",
  "email": "maria@empresa.com",
  "telefone": "11999999999",
  "tipoServico": ["Desenvolvimento"],
  "descricao": "Preciso de um site para minha loja."
}
```

### Equipe (`/api/team`)

| Método | Endpoint | Descrição | Proteção |
| :--- | :--- | :--- | :--- |
| GET | `/` | Lista os membros da equipe | Pública |
| POST | `/` | Adiciona novo membro | Admin |
| PATCH | `/:id` | Atualiza dados do membro | Admin |
| DELETE | `/:id` | Remove membro da equipe | Admin |

**Exemplo JSON (POST/PATCH):**
```json
{
  "nome": "Carla Tech",
  "cargo": "Desenvolvedora Senior",
  "bio": "Especialista em Node.js e React.",
  "linkedinUrl": "https://linkedin.com/in/perfil"
}
```

---

## 🕸️ API GraphQL

O endpoint único para o GraphQL é: `http://localhost:3000/graphql`.  
Você pode usar o **Apollo Sandbox** (navegando até o link acima no browser) para testar.

### Queries Principais
- `me`: Retorna perfil do usuário autenticado.
- `projects(categoria: String, destaque: Boolean, page: Int)`: Busca projetos com paginação e filtros.
- `project(id: ID!)`: Detalhes de um projeto.
- `quotes`: Lista orçamentos (Admin).
- `myQuotes`: Lista orçamentos do próprio usuário.
- `teamMembers`: Lista membros da equipe.

### Mutations Principais
- `login(input: LoginInput!)`: Gera token JWT.
- `register(input: RegisterInput!)`: Cria conta.
- `createProject(input: CreateProjectInput!)`: Novo projeto (Admin).
- `submitQuote(input: CreateQuoteInput!)`: Envia orçamento.
- `updateQuoteStatus(id: ID!, status: String!)`: Altera status (Admin).

---

## 🔐 Segurança e Validação

### JWT (JSON Web Tokens)
A segurança é baseada em Tokens. Quando você faz login, recebe um `token`. Esse token deve ser armazenado (geralmente no `localStorage` do frontend) e enviado em todas as requisições protegidas. 
- O backend valida a assinatura do token e extrai o ID do usuário.
- Existe distinção entre `user` (cliente) e `admin` (gestor da agência).

### Joi (Validação de Dados)
Para garantir que o banco de dados não receba lixo, usamos o **Joi**. Todas as entradas de dados (corpo da requisição) passam por um validador antes de chegar ao controller.
- **Exemplo de validação de registro**: O e-mail deve ser válido, a senha deve ter no mínimo 8 caracteres e o nome é obrigatório.
- Se os dados estiverem errados, a API retorna um erro `400 Bad Request` com uma mensagem explicativa.

---

## 📂 Estrutura de Pastas

- `/src/config`: Conexões com Banco de Dados e Helpers de JWT.
- `/src/controllers`: Lógica de negócio das rotas REST.
- `/src/graphql`: Definições (`typeDefs`) e implementações (`resolvers`) do GraphQL.
- `/src/middlewares`: Filtros de autenticação, erros e segurança.
- `/src/models`: Definição das tabelas (coleções) do MongoDB.
- `/src/routes`: Definição dos caminhos da API REST.
- `/src/validators`: Esquemas de validação do Joi.
- `/src/scripts`: Scripts utilitários (como o `seed.js`).

---

## 🖥️ Frontend

O frontend é servido estaticamente pelo próprio Express via `express.static('public')` e está 100% integrado à API.

### Páginas

| Arquivo | URL | Descrição |
| :--- | :--- | :--- |
| `index.html` | `/` | Landing page com projetos e equipe carregados da API |
| `login.html` | `/login.html` | Login com JWT |
| `registro.html` | `/registro.html` | Cadastro de nova conta |
| `esqueci-senha.html` | `/esqueci-senha.html` | Recuperação de senha |
| `contato.html` | `/contato.html` | Formulário de orçamento |
| `confirmacao.html` | `/confirmacao.html` | Confirmação de envio |
| `portfolio.html` | `/portfolio.html` | Portfólio carregado da API |
| `sobre.html` | `/sobre.html` | Equipe carregada da API |
| `painel.html` | `/painel.html` | Dashboard (cliente e admin — role-based) |

### Painel Admin

O painel detecta automaticamente o `role` do usuário via JWT:

- **Usuário comum**: visualiza e acompanha seus próprios orçamentos com status em tempo real.
- **Admin**: gerencia todos os orçamentos, projetos do portfólio e membros da equipe.

Funcionalidades do painel admin:
- **Orçamentos**: listagem com filtros por status, busca por cliente, alteração de status direto na tabela.
- **Projetos**: CRUD completo — criar, editar categorias/destaque e excluir projetos que refletem em `portfolio.html`.
- **Equipe**: CRUD completo — adicionar, editar nome/cargo/cor do avatar e remover membros que refletem em `sobre.html`.

### Tecnologias do Frontend

- HTML5 + CSS3 + JavaScript (Vanilla, sem frameworks)
- Módulos ES6 (`type="module"`)
- Font Awesome 6.5 (ícones via CDN)
- Google Fonts — Inter
- Design system próprio com variáveis CSS

---

**Desenvolvido com ❤️ pela equipe Dev4all.**