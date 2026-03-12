import 'dotenv/config';
import connectDB from './config/db.js';
import { createApp } from './app.js';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    await connectDB();

    const app = await createApp();

    app.listen(PORT, () => {
      const base = `http://localhost:${PORT}`;
      console.log(`\nDev4all rodando em ${base}`);
      console.log(`  REST    -> ${base}/api`);
      console.log(`  GraphQL -> ${base}/graphql`);
      console.log(`  Health  -> ${base}/api/health\n`);
    });
  } catch (err) {
    console.error('Falha ao iniciar servidor:', err.message);
    process.exit(1);
  }
}

bootstrap();
