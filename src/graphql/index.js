import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express4';
import { typeDefs } from './typeDefs/index.js';
import { resolvers } from './resolvers/index.js';
import { verifyToken } from '../config/jwt.js';

export async function createApolloMiddleware() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: process.env.NODE_ENV !== 'production',
    formatError: (formattedError) => {
      if (process.env.NODE_ENV === 'production') {
        return {
          message: formattedError.message,
          extensions: { code: formattedError.extensions?.code },
        };
      }
      return formattedError;
    },
  });

  await server.start();

  return expressMiddleware(server, {
    context: async ({ req }) => {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

      let user = null;
      if (token) {
        try {
          user = verifyToken(token);
        } catch {
          // token inválido ou expirado
        }
      }

      return { user };
    },
  });
}
