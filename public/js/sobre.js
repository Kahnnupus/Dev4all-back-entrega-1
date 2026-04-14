import { teamApi, getInitials } from './api.js';

const avatarColors = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

async function loadTeam() {
  const grid = document.getElementById('team-grid');
  if (!grid) return;

  const defaultTeam = [
    { nome: 'Felipe Almeida Albino', cargo: 'Product Owner & Dev Full Stack', initials: 'FA', color: '#2563eb' },
    { nome: 'Reuel Vinicius', cargo: 'Dev Back-end & DBA', initials: 'RV', color: '#10b981' },
    { nome: 'Nathan Feitoza', cargo: 'Dev Full Stack & UX Designer', initials: 'NF', color: '#8b5cf6' },
    { nome: 'Murilo Lacerda', cargo: 'Dev Front-end & QA', initials: 'ML', color: '#f59e0b' },
    { nome: 'Marcos Segundo', cargo: 'Estagiário de Suporte', initials: 'MS', color: '#ef4444' },
  ];

  try {
    const res = await teamApi.list();
    const members = res.data?.length ? res.data : null;
    const order = ['Felipe Almeida Albino', 'Rauel Vinicius', 'Nathan Feitoza', 'Murilo Lacerda', 'Marcos Segundo'];
    const sorted = members
      ? [...members].sort((a, b) => {
          const ia = order.indexOf(a.nome), ib = order.indexOf(b.nome);
          return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        }).map((m, i) => ({
          nome: m.nome,
          cargo: m.cargo,
          initials: getInitials(m.nome),
          color: avatarColors[i % avatarColors.length],
        }))
      : defaultTeam;
    renderTeam(grid, sorted);
  } catch {
    renderTeam(grid, defaultTeam);
  }
}

function renderTeam(grid, members) {
  grid.innerHTML = members.map(m => `
    <div class="team-card">
      <div class="team-avatar" style="background:${m.color}">${m.initials || getInitials(m.nome)}</div>
      <h3>${m.nome}</h3>
      <p class="text-muted">${m.cargo}</p>
    </div>
  `).join('');
}

loadTeam();
