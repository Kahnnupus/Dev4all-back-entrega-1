import {
  Auth, authApi, quotesApi, projectsApi, teamApi,
  showAlert, setLoading, formatDate, getInitials,
} from './api.js';
import { icons, iconEl } from './icons.js';

if (!Auth.isLoggedIn()) {
  window.location.href = '/login.html?redirect=/painel.html';
}

const user = Auth.getUser();

window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 5);
});
document.getElementById('navToggle')?.addEventListener('click', () => {
  document.getElementById('navLinks')?.classList.toggle('open');
});
document.getElementById('btnLogout')?.addEventListener('click', () => Auth.logout());

function initUserUI() {
  const initials  = getInitials(user?.nomeCompleto || '?');
  const firstName = user?.nomeCompleto?.split(' ')[0] || 'Usuário';

  // navbar
  document.getElementById('userAvatar').textContent = initials;
  document.getElementById('userName').textContent   = firstName;

  // sidebar
  document.getElementById('sidebarAvatar').textContent = initials;
  document.getElementById('sidebarName').textContent   = user?.nomeCompleto || '—';
  document.getElementById('sidebarRole').textContent   = user?.role === 'admin' ? 'Admin' : 'Usuário';

  // perfil
  document.getElementById('perfilAvatar').textContent = initials;
  document.getElementById('perfilNome').textContent   = user?.nomeCompleto || '—';
  document.getElementById('perfilEmail').textContent  = user?.email || '—';
  const roleEl = document.getElementById('perfilRole');
  roleEl.textContent = user?.role || 'user';
  roleEl.className   = `badge badge-${user?.role || 'user'}`;

  // itens de admin
  if (user?.role === 'admin') {
    document.getElementById('adminDivider')?.style.setProperty('display', 'block');
    document.getElementById('navAdminOrc')?.style.setProperty('display', 'flex');
    document.getElementById('navAdminProj')?.style.setProperty('display', 'flex');
    document.getElementById('navAdminEquipe')?.style.setProperty('display', 'flex');
  }
}

function switchTab(tabName) {
  document.querySelectorAll('.painel-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.painel-nav__item').forEach(n => n.classList.remove('active'));

  const tab = document.getElementById(`tab-${tabName}`);
  const nav = document.querySelector(`[data-tab="${tabName}"]`);
  if (tab) tab.classList.add('active');
  if (nav) nav.classList.add('active');

  switch (tabName) {
    case 'orcamentos':       loadMyQuotes(); break;
    case 'perfil':           loadPerfil(); break;
    case 'admin-orcamentos': loadAdminQuotes(); break;
    case 'admin-projetos':   loadAdminProjects(); break;
    case 'admin-equipe':     loadAdminTeam(); break;
  }
}

document.querySelectorAll('.painel-nav__item').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab(item.dataset.tab);
  });
});

const tabFromHash = location.hash.replace('#', '') || 'orcamentos';

let myQuotes = [];

async function loadMyQuotes() {
  const tbody = document.getElementById('myQuotesTbody');
  tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted" style="padding:2rem">Carregando...</td></tr>`;

  try {
    const data = await quotesApi.my();
    myQuotes   = data.data || [];
    renderMyQuotes();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><div class="empty-state__icon">${iconEl(icons.alertTriangle, 40)}</div><p>${err.message}</p></div></td></tr>`;
  }
}

function renderMyQuotes() {
  const tbody = document.getElementById('myQuotesTbody');

  if (myQuotes.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="4">
        <div class="empty-state">
          <div class="empty-state__icon">${iconEl(icons.clipboardList, 40)}</div>
          <h3>Nenhum orçamento ainda</h3>
          <p>Você ainda não enviou nenhuma solicitação.</p>
          <a href="/orcamento.html" class="btn btn-primary" style="margin-top:1rem">Fazer orçamento</a>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = myQuotes.map(q => `
    <tr>
      <td>
        <div style="font-weight:600;color:var(--gray-900)">${(q.tipoServico || []).join(', ')}</div>
        <div style="font-size:0.75rem;color:var(--gray-400);margin-top:2px">${q.descricao?.slice(0, 60)}${q.descricao?.length > 60 ? '&hellip;' : ''}</div>
      </td>
      <td><span class="badge badge-${q.status}">${statusLabel(q.status)}</span></td>
      <td style="color:var(--gray-500)">${formatDate(q.createdAt)}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="openQuoteModal('${q._id}', 'mine')">
          Ver detalhes
        </button>
      </td>
    </tr>
  `).join('');
}

async function loadPerfil() {
  try {
    if (myQuotes.length === 0) {
      const d = await quotesApi.my();
      myQuotes = d.data || [];
    }
    const aprovados = myQuotes.filter(q => q.status === 'aprovado').length;
    const pendentes = myQuotes.filter(q => ['pendente', 'em_analise'].includes(q.status)).length;

    document.getElementById('totalOrcamentos').textContent     = myQuotes.length;
    document.getElementById('orcamentosAprovados').textContent = aprovados;
    document.getElementById('orcamentosPendentes').textContent = pendentes;
  } catch { /* silencioso */ }
}

let adminPage = 1;

async function loadAdminQuotes(page = 1) {
  adminPage = page;
  const tbody  = document.getElementById('adminQuotesTbody');
  const status = document.getElementById('filterStatus')?.value;
  tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding:2rem">Carregando...</td></tr>`;

  try {
    const params = { page, limit: 15 };
    if (status) params.status = status;
    const data   = await quotesApi.list(params);
    const quotes = data.data || [];
    const total  = data.total || 0;

    if (quotes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-state__icon">${iconEl(icons.inbox, 40)}</div><h3>Nenhum orçamento</h3></div></td></tr>`;
      return;
    }

    tbody.innerHTML = quotes.map(q => `
      <tr>
        <td>
          <div style="font-weight:600">${q.nomeCompleto}</div>
          <div style="font-size:0.75rem;color:var(--gray-400)">${q.email}</div>
        </td>
        <td>${(q.tipoServico || []).map(s => `<span class="chip" style="font-size:0.7rem;padding:2px 8px">${s}</span>`).join(' ')}</td>
        <td>
          <select class="status-select" onchange="updateStatus('${q._id}', this.value)">
            <option value="pendente"   ${q.status === 'pendente'   ? 'selected' : ''}>Pendente</option>
            <option value="em_analise" ${q.status === 'em_analise' ? 'selected' : ''}>Em Análise</option>
            <option value="aprovado"   ${q.status === 'aprovado'   ? 'selected' : ''}>Aprovado</option>
            <option value="rejeitado"  ${q.status === 'rejeitado'  ? 'selected' : ''}>Rejeitado</option>
          </select>
        </td>
        <td style="color:var(--gray-500)">${formatDate(q.createdAt)}</td>
        <td>
          <div class="flex gap-2">
            <button class="btn btn-outline btn-sm" onclick="openQuoteModal('${q._id}', 'admin')">Ver</button>
            <button class="btn btn-danger btn-sm" onclick="deleteQuote('${q._id}')" title="Excluir">${iconEl(icons.trash, 14)}</button>
          </div>
        </td>
      </tr>
    `).join('');

    renderPagination('adminQuotesPagination', total, 15, page, loadAdminQuotes);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:var(--danger);padding:2rem">${err.message}</td></tr>`;
  }
}

document.getElementById('filterStatus')?.addEventListener('change', () => loadAdminQuotes(1));

let editingProjectId = null;

async function loadAdminProjects() {
  const grid = document.getElementById('adminProjectsGrid');
  grid.innerHTML = '<p class="text-muted">Carregando...</p>';

  try {
    const data = await projectsApi.list({ limit: 50 });
    const projs = data.data || [];

    if (projs.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">${iconEl(icons.folderOpen, 40)}</div><h3>Nenhum projeto</h3><p>Adicione o primeiro projeto ao portfolio.</p></div>`;
      return;
    }

    grid.innerHTML = projs.map(p => `
      <div class="admin-project-card">
        ${p.imagemUrl
          ? `<img src="${p.imagemUrl}" alt="${p.titulo}" loading="lazy" />`
          : `<div style="height:140px;background:var(--gray-100);display:flex;align-items:center;justify-content:center;color:var(--gray-400)">${iconEl(icons.image, 40)}</div>`}
        <div class="admin-project-card__body">
          <div class="admin-project-card__title">${p.titulo}</div>
          <div class="chips" style="margin-bottom:0.5rem">
            ${(p.categorias || []).map(c => `<span class="chip" style="font-size:0.7rem;padding:2px 8px">${c}</span>`).join('')}
            ${p.destaque ? `<span class="badge badge-aprovado" style="font-size:0.65rem;display:inline-flex;align-items:center;gap:3px">${iconEl(icons.star, 11)} Destaque</span>` : ''}
            ${!p.ativo   ? '<span class="badge badge-rejeitado" style="font-size:0.65rem">Inativo</span>' : ''}
          </div>
          <div class="admin-project-card__actions">
            <button class="btn btn-outline btn-sm" onclick="openProjectModal('${p._id}')">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="deleteProject('${p._id}')" title="Desativar">${iconEl(icons.trash, 14)}</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p style="color:var(--danger)">${err.message}</p></div>`;
  }
}

async function loadAdminTeam() {
  const grid = document.getElementById('adminTeamGrid');
  grid.innerHTML = '<p class="text-muted">Carregando...</p>';

  try {
    const data    = await teamApi.list();
    const members = data.data || [];

    if (members.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-state__icon">${iconEl(icons.users, 40)}</div><h3>Nenhum membro</h3></div>`;
      return;
    }

    grid.innerHTML = members.map(m => `
      <div class="team-card">
        <div class="team-card__avatar">
          ${m.fotoUrl
            ? `<img src="${m.fotoUrl}" alt="${m.nome}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`
            : getInitials(m.nome)}
        </div>
        <div class="team-card__name">${m.nome}</div>
        <div class="team-card__role">${m.cargo}</div>
        ${m.bio ? `<div class="team-card__bio">${m.bio}</div>` : ''}
        <div class="flex gap-2" style="justify-content:center;margin-top:0.75rem">
          <button class="btn btn-outline btn-sm" onclick="openMemberModal('${m._id}')">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deleteMember('${m._id}')" title="Desativar">${iconEl(icons.trash, 14)}</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p style="color:var(--danger)">${err.message}</p></div>`;
  }
}

function renderPagination(containerId, total, limit, current, callback) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const pages = Math.ceil(total / limit);
  if (pages <= 1) { container.innerHTML = ''; return; }

  let html = '';
  if (current > 1) html += `<button onclick="${callback.name}(${current - 1})">&lsaquo;</button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="${i === current ? 'active' : ''}" onclick="${callback.name}(${i})">${i}</button>`;
  }
  if (current < pages) html += `<button onclick="${callback.name}(${current + 1})">&rsaquo;</button>`;
  container.innerHTML = html;
}

window.openQuoteModal = async function(id, mode) {
  const overlay = document.getElementById('quoteModal');
  const content = document.getElementById('modalContent');
  const title   = document.getElementById('modalTitle');
  overlay.classList.add('open');
  content.innerHTML = '<p class="text-muted">Carregando...</p>';

  try {
    const data = await quotesApi.get(id);
    const q    = data.data;
    title.textContent = `Orçamento — ${(q.tipoServico || []).join(', ')}`;

    content.innerHTML = `
      <div style="display:grid;gap:var(--space-4)">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4)">
          <div>
            <div style="font-size:0.75rem;color:var(--gray-400);font-weight:600;text-transform:uppercase;margin-bottom:4px">Cliente</div>
            <div style="font-weight:600">${q.nomeCompleto}</div>
          </div>
          <div>
            <div style="font-size:0.75rem;color:var(--gray-400);font-weight:600;text-transform:uppercase;margin-bottom:4px">Status</div>
            <span class="badge badge-${q.status}">${statusLabel(q.status)}</span>
          </div>
          <div>
            <div style="font-size:0.75rem;color:var(--gray-400);font-weight:600;text-transform:uppercase;margin-bottom:4px">E-mail</div>
            <div>${q.email}</div>
          </div>
          <div>
            <div style="font-size:0.75rem;color:var(--gray-400);font-weight:600;text-transform:uppercase;margin-bottom:4px">Telefone</div>
            <div>${q.telefone}</div>
          </div>
          <div>
            <div style="font-size:0.75rem;color:var(--gray-400);font-weight:600;text-transform:uppercase;margin-bottom:4px">Tipo de serviço</div>
            <div class="chips">${(q.tipoServico || []).map(s => `<span class="chip">${s}</span>`).join('')}</div>
          </div>
          <div>
            <div style="font-size:0.75rem;color:var(--gray-400);font-weight:600;text-transform:uppercase;margin-bottom:4px">Data</div>
            <div>${formatDate(q.createdAt)}</div>
          </div>
        </div>
        <div>
          <div style="font-size:0.75rem;color:var(--gray-400);font-weight:600;text-transform:uppercase;margin-bottom:8px">Descrição do projeto</div>
          <div style="background:var(--gray-50);border-radius:var(--radius);padding:var(--space-4);color:var(--gray-700);line-height:1.7;font-size:var(--font-sm)">${q.descricao}</div>
        </div>
        ${mode === 'admin' ? `
        <div style="margin-top:var(--space-4)">
          <label style="font-size:0.75rem;color:var(--gray-600);font-weight:600;display:block;margin-bottom:8px">ALTERAR STATUS</label>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap">
            ${['pendente', 'em_analise', 'aprovado', 'rejeitado'].map(s => `
              <button class="btn ${s === q.status ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="updateStatus('${q._id}','${s}',true)">
                ${statusLabel(s)}
              </button>`).join('')}
          </div>
        </div>` : ''}
      </div>
    `;
  } catch (err) {
    content.innerHTML = `<p style="color:var(--danger)">${err.message}</p>`;
  }
};

window.updateStatus = async function(id, status, reloadModal = false) {
  try {
    await quotesApi.updateStatus(id, status);
    if (reloadModal) {
      openQuoteModal(id, 'admin');
    } else {
      loadAdminQuotes(adminPage);
    }
  } catch (err) {
    alert('Erro ao atualizar status: ' + err.message);
  }
};

window.deleteQuote = async function(id) {
  if (!confirm('Tem certeza que deseja excluir este orçamento?')) return;
  try {
    await quotesApi.delete(id);
    loadAdminQuotes(adminPage);
  } catch (err) {
    alert('Erro: ' + err.message);
  }
};

window.deleteProject = async function(id) {
  if (!confirm('Desativar este projeto?')) return;
  try {
    await projectsApi.delete(id);
    loadAdminProjects();
  } catch (err) {
    alert('Erro: ' + err.message);
  }
};

window.deleteMember = async function(id) {
  if (!confirm('Desativar este membro?')) return;
  try {
    await teamApi.delete(id);
    loadAdminTeam();
  } catch (err) {
    alert('Erro: ' + err.message);
  }
};

window.openProjectModal = async function(id) {
  editingProjectId = id || null;
  const overlay = document.getElementById('projectModal');
  const titleEl = document.getElementById('projectModalTitle');
  overlay.classList.add('open');

  if (id) {
    titleEl.textContent = 'Editar Projeto';
    try {
      const data = await projectsApi.get(id);
      const p    = data.data;
      document.getElementById('pTitulo').value     = p.titulo || '';
      document.getElementById('pDescricao').value  = p.descricao || '';
      document.getElementById('pCategorias').value = (p.categorias || []).join(', ');
      document.getElementById('pImagemUrl').value  = p.imagemUrl || '';
      document.getElementById('pLinkExterno').value = p.linkExterno || '';
      document.getElementById('pDestaque').checked = !!p.destaque;
    } catch { /* silencioso */ }
  } else {
    titleEl.textContent = 'Novo Projeto';
    document.getElementById('projectForm').reset();
  }
};

document.getElementById('btnNewProject')?.addEventListener('click', () => openProjectModal(null));

document.getElementById('cancelProjectBtn')?.addEventListener('click', () => {
  document.getElementById('projectModal').classList.remove('open');
});

document.getElementById('closeProjectModal')?.addEventListener('click', () => {
  document.getElementById('projectModal').classList.remove('open');
});

document.getElementById('projectForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('saveProjectBtn');
  setLoading(btn, true);

  const payload = {
    titulo:      document.getElementById('pTitulo').value.trim(),
    descricao:   document.getElementById('pDescricao').value.trim(),
    categorias:  document.getElementById('pCategorias').value.split(',').map(c => c.trim()).filter(Boolean),
    imagemUrl:   document.getElementById('pImagemUrl').value.trim() || undefined,
    linkExterno: document.getElementById('pLinkExterno').value.trim() || undefined,
    destaque:    document.getElementById('pDestaque').checked,
  };

  try {
    if (editingProjectId) {
      await projectsApi.update(editingProjectId, payload);
    } else {
      await projectsApi.create(payload);
    }
    document.getElementById('projectModal').classList.remove('open');
    loadAdminProjects();
  } catch (err) {
    alert('Erro: ' + err.message);
    setLoading(btn, false);
  }
});

let editingMemberId = null;

window.openMemberModal = async function(id) {
  editingMemberId = id || null;
  const overlay = document.getElementById('memberModal');
  const titleEl = document.getElementById('memberModalTitle');
  overlay.classList.add('open');

  document.getElementById('memberForm').reset();

  if (id) {
    titleEl.textContent = 'Editar Membro';
    try {
      const data = await teamApi.get(id);
      const m    = data.data;
      document.getElementById('mNome').value     = m.nome || '';
      document.getElementById('mCargo').value    = m.cargo || '';
      document.getElementById('mBio').value      = m.bio || '';
      document.getElementById('mLinkedin').value = m.linkedinUrl || '';
      document.getElementById('mGithub').value   = m.githubUrl || '';
      document.getElementById('mFoto').value     = m.fotoUrl || '';
      document.getElementById('mOrdem').value    = m.ordem ?? 1;
    } catch { /* silencioso */ }
  } else {
    titleEl.textContent = 'Novo Membro';
  }
};

document.getElementById('btnNewMember')?.addEventListener('click', () => openMemberModal(null));

document.getElementById('cancelMemberBtn')?.addEventListener('click', () => {
  document.getElementById('memberModal').classList.remove('open');
});

document.getElementById('closeMemberModal')?.addEventListener('click', () => {
  document.getElementById('memberModal').classList.remove('open');
});

document.getElementById('memberForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('saveMemberBtn');
  setLoading(btn, true);

  const payload = {
    nome:        document.getElementById('mNome').value.trim(),
    cargo:       document.getElementById('mCargo').value.trim(),
    bio:         document.getElementById('mBio').value.trim() || undefined,
    linkedinUrl: document.getElementById('mLinkedin').value.trim() || undefined,
    githubUrl:   document.getElementById('mGithub').value.trim() || undefined,
    fotoUrl:     document.getElementById('mFoto').value.trim() || undefined,
    ordem:       parseInt(document.getElementById('mOrdem').value, 10) || 1,
  };

  try {
    if (editingMemberId) {
      await teamApi.update(editingMemberId, payload);
    } else {
      await teamApi.create(payload);
    }
    document.getElementById('memberModal').classList.remove('open');
    loadAdminTeam();
  } catch (err) {
    alert('Erro: ' + err.message);
    setLoading(btn, false);
  }
});

document.getElementById('closeModal')?.addEventListener('click', () => {
  document.getElementById('quoteModal').classList.remove('open');
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

function statusLabel(s) {
  return { pendente: 'Pendente', em_analise: 'Em Análise', aprovado: 'Aprovado', rejeitado: 'Rejeitado' }[s] || s;
}

initUserUI();

// tab inicial via ?tab= ou hash
const urlParams  = new URLSearchParams(location.search);
const initialTab = urlParams.get('tab') || tabFromHash || 'orcamentos';
switchTab(initialTab);
