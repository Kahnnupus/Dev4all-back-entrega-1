import { projectsApi, teamApi, isLoggedIn, isAdmin, getUser } from './api.js';

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  nav?.classList.toggle('scrolled', window.scrollY > 60);
});

// Mobile menu
document.getElementById('menu-toggle')?.addEventListener('click', () => {
  document.getElementById('nav-menu')?.classList.toggle('open');
});

// Nav auth state
function initNav() {
  const loginBtn = document.getElementById('nav-login');
  const painelBtn = document.getElementById('nav-painel');
  const verificarBtn = document.getElementById('btn-verificar-orcamento');
  if (isLoggedIn()) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (painelBtn) { painelBtn.style.display = 'block'; painelBtn.textContent = isAdmin() ? 'Painel Admin' : 'Meu Painel'; }
    if (verificarBtn) verificarBtn.style.display = 'none';
  }
}

// Load featured projects
async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  try {
    const res = await projectsApi.list({ destaque: true, limit: 3 });
    const projects = res.data || [];
    if (!projects.length) { grid.innerHTML = '<p class="text-muted text-center">Nenhum projeto em destaque.</p>'; return; }
    grid.innerHTML = projects.map(p => `
      <div class="project-card">
        <div class="browser-mockup">
          <div class="browser-bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
          <div class="browser-content"></div>
        </div>
        <div class="project-info">
          <div class="project-meta">
            <span class="tech-tag">${(p.categorias || [])[0] || 'Web'}</span>
            <span class="project-type text-muted">${p.titulo}</span>
          </div>
          <h3>${p.titulo}</h3>
          <p class="text-muted">${p.descricao?.substring(0, 100)}...</p>
        </div>
      </div>
    `).join('');
  } catch {
    grid.innerHTML = getDefaultProjects();
  }
}

function getDefaultProjects() {
  const projects = [
    { tech: 'React + Node', type: 'E-commerce', name: 'E-commerce MercadoBR', desc: 'Plataforma completa com gestão de produtos e pagamentos.' },
    { tech: 'React Native', type: 'Mobile App', name: 'App TechFlow Mobile', desc: 'App de monitoramento em tempo real com dashboard interativo.' },
    { tech: 'Next.js + API', type: 'SaaS Platform', name: 'Plataforma StartupX', desc: 'Dashboard analytics com gráficos interativos e gestão de usuários.' },
  ];
  return projects.map(p => `
    <div class="project-card">
      <div class="browser-mockup">
        <div class="browser-bar"><span class="dot red"></span><span class="dot yellow"></span><span class="dot green"></span></div>
        <div class="browser-content"></div>
      </div>
      <div class="project-info">
        <div class="project-meta">
          <span class="tech-tag">${p.tech}</span>
          <span class="project-type text-muted">${p.type}</span>
        </div>
        <h3>${p.name}</h3>
        <p class="text-muted">${p.desc}</p>
      </div>
    </div>
  `).join('');
}

// Load team
async function loadTeam() {
  const grid = document.getElementById('team-grid');
  if (!grid) return;
  try {
    const res = await teamApi.list();
    const members = res.data || [];
    if (!members.length) return;
    // Team is in Sobre page
  } catch {}
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

initNav();
loadProjects();
loadTeam();
