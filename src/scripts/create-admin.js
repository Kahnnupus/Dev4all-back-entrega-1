import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import { signToken } from '../config/jwt.js';

async function createAdmin() {
  try {
    console.log('--- Iniciando Criação de Admin ---');
    
    // Tenta conectar ao banco
    await connectDB();

    const adminData = {
      nomeCompleto: 'Admin Suporte',
      email: 'admin_suporte@dev4all.com',
      senha: 'admin_password_123',
      role: 'admin',
      ativo: true
    };

    // Verifica se já existe
    let user = await User.findOne({ email: adminData.email });

    if (user) {
      console.log('Usuário admin já existe. Atualizando senha...');
      user.senha = adminData.senha;
      await user.save();
    } else {
      console.log('Criando novo usuário admin...');
      user = await User.create(adminData);
    }

    // Gera o token
    const token = signToken(user._id, user.role);

    console.log('\n--- SUCESSO ---');
    console.log(`Usuário: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Token Bearer:\nBearer ${token}\n`);

  } catch (error) {
    console.error('\n--- ERRO ---');
    console.error(error.message);
    if (error.message.includes('MONGODB_URI')) {
      console.error('DICA: Verifique se o arquivo .env existe e contém MONGODB_URI.');
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
