import { projectsApi } from './api.js';

async function loadPortfolio() {
  const grid = document.getElementById('portfolio-grid');
  if (!grid) return;

  const defaultProjects = [
    { tech: 'React + Node', techColor: '#22c55e', type: 'E-commerce', name: 'Site do Cliente A', desc: 'Desenvolvimento de E-commerce completo com gestão de produtos e pagamentos online.' },
    { tech: 'Next.js', techColor: '#3b82f6', type: 'Portal', name: 'Portal de Notícias', desc: 'Portal informativo com CMS integrado e SEO avançado para alta performance.' },
    { tech: 'WordPress', techColor: '#8b5cf6', type: 'Blog', name: 'Blog do Cliente B', desc: 'Plataforma de Blog Pessoal otimizada para SEO com layout moderno e responsivo.' },
    { tech: 'React Native', techColor: '#f59e0b', type: 'App Mobile', name: 'App TechFlow Mobile', desc: 'Aplicativo para monitoramento em tempo real com dashboard interativo e notificações.' },
    { tech: 'Vue + Laravel', techColor: '#10b981', type: 'Sistema Web', name: 'Sistema Corporativo', desc: 'Sistema de gestão completo com módulos de RH, financeiro e relatórios gerenciais.' },
    { tech: 'React + API', techColor: '#6366f1', type: 'SaaS', name: 'Dashboard SaaS', desc: 'Dashboard com analytics em tempo real, gráficos interativos e gestão de usuários.' },
  ];

  try {
    const res = await projectsApi.list({ limit: 6 });
    const projects = res.data?.length ? res.data : null;
    renderProjects(grid, projects ? projects.map((p, i) => ({
      tech: (p.categorias||[])[0] || defaultProjects[i]?.tech || 'Web',
      techColor: defaultProjects[i]?.techColor || '#2563eb',
      type: (p.categorias||[]).slice(1).join(', ') || defaultProjects[i]?.type || '',
      name: p.titulo,
      desc: p.descricao,
      link: p.linkExterno,
    })) : defaultProjects);
  } catch {
    renderProjects(grid, defaultProjects);
  }
}

function renderProjects(grid, projects) {
  grid.innerHTML = projects.map(p => `
    <div class="port-card">
      <div class="browser-mockup">
        <div class="browser-bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
        <div class="browser-content"></div>
      </div>
      <div class="port-card-body">
        <div class="port-meta">
          <span class="tech-tag" style="background:${p.techColor}20;color:${p.techColor};border:1px solid ${p.techColor}40">${p.tech}</span>
          ${p.type ? `<span class="text-muted" style="font-size:13px">${p.type}</span>` : ''}
        </div>
        <h3>${p.name}</h3>
        <p class="text-muted">${p.desc}</p>
      </div>
    </div>
  `).join('');
}

loadPortfolio();
