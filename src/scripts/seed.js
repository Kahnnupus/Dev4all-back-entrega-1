// seed.js — popula o banco com dados iniciais
// uso: npm run seed
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import TeamMember from '../models/TeamMember.js';
import Quote from '../models/Quote.js';

const teamData = [
  {
    nome: 'Felipe Almeida Albino',
    cargo: 'Product Owner & Dev Full Stack',
    bio: 'Líder técnico da equipe, especialista em arquitetura de sistemas e gestão de projetos ágeis.',
    linkedinUrl: '#',
    githubUrl: '#',
    ordem: 1,
  },
  {
    nome: 'Rauel Vinicius',
    cargo: 'Dev Back-end & DBA',
    bio: 'Especialista em bancos de dados relacionais e não-relacionais, APIs RESTful e performance.',
    linkedinUrl: '#',
    githubUrl: '#',
    ordem: 2,
  },
  {
    nome: 'Nathan Feitoza',
    cargo: 'Dev Full Stack & UX Designer',
    bio: 'Apaixonado por interfaces intuitivas e código limpo. Responsável pelo design system e frontend.',
    linkedinUrl: '#',
    githubUrl: '#',
    ordem: 3,
  },
  {
    nome: 'Murilo Lacerda',
    cargo: 'Dev Front-end & QA',
    bio: 'Especialista em React, testes automatizados e garantia de qualidade de software.',
    linkedinUrl: '#',
    githubUrl: '#',
    ordem: 4,
  },
];

const projectsData = [
  {
    titulo: 'E-commerce ModaStyle',
    descricao: 'Plataforma de e-commerce completa para loja de moda com catálogo de produtos, carrinho, checkout e painel administrativo. Desenvolvida com React, Node.js e MongoDB.',
    categorias: ['Desenvolvimento', 'Design'],
    imagemUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800',
    destaque: true,
    ativo: true,
  },
  {
    titulo: 'Sistema de Gestão Clínica Vida+',
    descricao: 'Sistema de agendamento e gestão para clínica médica com prontuário eletrônico, controle de estoque e relatórios gerenciais.',
    categorias: ['Desenvolvimento', 'Consultoria'],
    imagemUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    destaque: true,
    ativo: true,
  },
  {
    titulo: 'App Mobile FinTrack',
    descricao: 'Aplicativo de controle financeiro pessoal com dashboard interativo, categorização automática de gastos e metas de economia.',
    categorias: ['Design', 'Marketing'],
    imagemUrl: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800',
    destaque: true,
    ativo: true,
  },
  {
    titulo: 'Landing Page TechStart',
    descricao: 'Página de vendas de alta conversão para startup de tecnologia com animações, integração de formulários e A/B testing.',
    categorias: ['Design', 'Marketing'],
    imagemUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
    destaque: false,
    ativo: true,
  },
  {
    titulo: 'API de Pagamentos PayFlow',
    descricao: 'Integração robusta com gateways de pagamento (Stripe, Mercado Pago) com webhook handlers, retry logic e logs detalhados.',
    categorias: ['Desenvolvimento', 'Consultoria'],
    imagemUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800',
    destaque: false,
    ativo: true,
  },
  {
    titulo: 'Dashboard Analytics ProData',
    descricao: 'Painel de business intelligence com visualizações interativas, exportação de relatórios e integração com diversas fontes de dados.',
    categorias: ['Desenvolvimento', 'Design'],
    imagemUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    destaque: false,
    ativo: true,
  },
];

async function seed() {
  try {
    console.log('Iniciando seed...\n');
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      TeamMember.deleteMany({}),
      Quote.deleteMany({}),
    ]);
    console.log('Collections limpas');

    const admin = await User.create({
      nomeCompleto: 'Nathan Feitoza (Admin)',
      email: 'admin@dev4all.com',
      senha: 'admin',
      role: 'admin',
    });
    console.log(`Admin criado: ${admin.email}`);

    const team = await TeamMember.insertMany(teamData);
    console.log(`${team.length} membros da equipe criados`);

    const projectsWithAuthor = projectsData.map((p) => ({ ...p, criadoPor: admin._id }));
    const projects = await Project.insertMany(projectsWithAuthor);
    console.log(`${projects.length} projetos criados`);

    const quotes = await Quote.insertMany([
      {
        nomeCompleto: 'Maria Oliveira',
        email: 'maria@empresa.com.br',
        telefone: '(11) 99999-0001',
        tipoServico: ['Desenvolvimento', 'Design'],
        descricao: 'Precisamos de um sistema de e-commerce completo com integração de pagamentos.',
        status: 'em_analise',
        usuario: null,
      },
      {
        nomeCompleto: 'João Santos',
        email: 'joao@startup.io',
        telefone: '(21) 88888-0002',
        tipoServico: ['Marketing', 'Consultoria'],
        descricao: 'Quero melhorar minha presença digital e aumentar as conversões da landing page.',
        status: 'pendente',
        usuario: null,
      },
      {
        nomeCompleto: 'Ana Lima',
        email: 'ana@consultoria.com',
        telefone: '(31) 77777-0003',
        tipoServico: ['Consultoria'],
        descricao: 'Consultoria para levantamento de requisitos de um sistema de gestão interno.',
        status: 'aprovado',
        usuario: null,
      },
    ]);
    console.log(`${quotes.length} orçamentos criados`);

    console.log('\nSeed concluído\n');
    console.log('Credenciais: admin@dev4all.com | admin');
  } catch (err) {
    console.error('Erro no seed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Desconectado do MongoDB');
  }
}

seed();
