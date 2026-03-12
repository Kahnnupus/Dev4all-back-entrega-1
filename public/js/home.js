import { projectsApi, teamApi, Auth, getInitials } from './api.js';
import { icons, iconEl } from './icons.js';

const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
const btnLogin  = document.getElementById('btnLogin');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);

  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  document.querySelectorAll('.navbar__links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `/#${current}` || a.getAttribute('href') === `#${current}`);
  });
});

navToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// "Painel Admin" só aparece para usuários com role === 'admin'
if (Auth.isLoggedIn()) {
  const user = Auth.getUser();
  if (btnLogin && user?.role === 'admin') {
    btnLogin.textContent = 'Painel Admin';
    btnLogin.href        = '/painel.html';
    btnLogin.className   = 'btn btn-primary btn-sm';
  }
}

const projectsGrid = document.getElementById('projectsGrid');
let allProjects    = [];
let currentFilter  = 'all';
let currentPage    = 1;
const LIMIT        = 6;

async function loadProjects() {
  try {
    const data = await projectsApi.list({ limit: LIMIT * 3 });
    allProjects = data.data || [];
    renderProjects();
  } catch (err) {
    projectsGrid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state__icon">${iconEl(icons.frown, 40)}</div>
        <h3>Erro ao carregar projetos</h3>
        <p>${err.message}</p>
      </div>`;
  }
}

function renderProjects() {
  const filtered = currentFilter === 'all'
    ? allProjects
    : allProjects.filter(p => p.categorias?.includes(currentFilter));

  const pageProjects = filtered.slice(0, currentPage * LIMIT);

  if (filtered.length === 0) {
    projectsGrid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state__icon">${iconEl(icons.search, 40)}</div>
        <h3>Nenhum projeto encontrado</h3>
        <p>Não há projetos na categoria selecionada.</p>
      </div>`;
    return;
  }

  projectsGrid.innerHTML = pageProjects.map(proj => `
    <div class="card" data-categories="${(proj.categorias || []).join(',')}">
      ${proj.imagemUrl
        ? `<img class="card__image" src="${proj.imagemUrl}" alt="${proj.titulo}" loading="lazy" />`
        : `<div class="card__image-placeholder">${iconEl(icons.image, 40)}</div>`}
      <div class="card__body">
        <div class="chips">
          ${(proj.categorias || []).map(c => `<span class="chip">${c}</span>`).join('')}
        </div>
        <h3 class="card__title">${proj.titulo}</h3>
        <p class="card__desc">${proj.descricao}</p>
        ${proj.linkExterno
          ? `<a href="${proj.linkExterno}" target="_blank" class="btn btn-outline btn-sm">Ver projeto &rarr;</a>`
          : ''}
      </div>
    </div>
  `).join('');

  const showMoreBtn = document.getElementById('portfolioShowMore');
  if (showMoreBtn) {
    showMoreBtn.style.display = pageProjects.length < filtered.length ? 'block' : 'none';
  }
}

document.querySelectorAll('.portfolio-filters .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.portfolio-filters .chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    currentFilter = chip.dataset.filter;
    currentPage   = 1;
    renderProjects();
  });
});

document.getElementById('btnLoadMore')?.addEventListener('click', (e) => {
  e.preventDefault();
  currentPage++;
  renderProjects();
});

const teamGrid = document.getElementById('teamGrid');

async function loadTeam() {
  try {
    const data    = await teamApi.list();
    const members = data.data || [];

    if (members.length === 0) {
      teamGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>Equipe em breve!</p></div>`;
      return;
    }

    teamGrid.innerHTML = members.map(m => `
      <div class="team-card">
        <div class="team-card__avatar">
          ${m.fotoUrl
            ? `<img src="${m.fotoUrl}" alt="${m.nome}" />`
            : getInitials(m.nome)}
        </div>
        <div class="team-card__name">${m.nome}</div>
        <div class="team-card__role">${m.cargo}</div>
        ${m.bio ? `<div class="team-card__bio">${m.bio}</div>` : ''}
        <div class="team-card__links">
          ${m.linkedinUrl && m.linkedinUrl !== '#'
            ? `<a href="${m.linkedinUrl}" target="_blank" aria-label="LinkedIn">${iconEl(icons.linkedin, 18)}</a>`
            : ''}
          ${m.githubUrl && m.githubUrl !== '#'
            ? `<a href="${m.githubUrl}" target="_blank" aria-label="GitHub">${iconEl(icons.github, 18)}</a>`
            : ''}
        </div>
      </div>
    `).join('');
  } catch (err) {
    teamGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p>Erro ao carregar equipe.</p></div>`;
  }
}

loadProjects();
loadTeam();
