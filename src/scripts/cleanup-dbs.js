// cleanup-dbs.js — remove databases de amostra do MongoDB Atlas
// mantém apenas: dev4all, admin, local, config
// uso: node src/scripts/cleanup-dbs.js
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const KEEP = new Set(['dev4all', 'admin', 'local', 'config']);
const URI  = process.env.MONGODB_URI;

if (!URI) {
  console.error('MONGODB_URI não definido no .env');
  process.exit(1);
}

const client = new MongoClient(URI);

async function main() {
  await client.connect();
  console.log('Conectado ao MongoDB Atlas');

  const admin = client.db('admin');
  const { databases } = await admin.command({ listDatabases: 1 });

  console.log('\nDatabases encontrados:');
  for (const db of databases) {
    const name = db.name;
    const size = (db.sizeOnDisk / 1024 / 1024).toFixed(2);
    if (KEEP.has(name)) {
      console.log(`  [MANTER]  ${name}  (${size} MB)`);
    } else {
      console.log(`  [REMOVER] ${name}  (${size} MB)`);
      await client.db(name).dropDatabase();
      console.log(`             -> ${name} removido`);
    }
  }

  console.log('\nLimpeza concluída.');
  await client.close();
}

main().catch(err => {
  console.error('Erro:', err.message);
  client.close();
  process.exit(1);
});
