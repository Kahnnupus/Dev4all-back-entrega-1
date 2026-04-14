import { quotesApi, projectsApi, teamApi, getUser, isAdmin, clearAuth, formatDate, getInitials, showAlert, setLoading } from './api.js';

const user = getUser();
if (!user) window.location.href = '/login.html';

const admin = isAdmin();

// === INIT UI ===
function initUI() {
  // Sidebar logo badge
  const adminBadge = document.getElementById('admin-badge');
  if (adminBadge) adminBadge.style.display = admin ? 'inline' : 'none';

  // Avatar + name
  document.querySelectorAll('.user-name').forEach(el => el.textContent = user.nomeCompleto);
  document.querySelectorAll('.user-role').forEach(el => el.textContent = admin ? 'Super Admin' : 'Usuário');
  document.querySelectorAll('.user-avatar').forEach(el => el.textContent = getInitials(user.nomeCompleto));

  // Show correct sidebar nav
  const userNav = document.getElementById('user-nav');
  const adminNav = document.getElementById('admin-nav');
  if (userNav) userNav.style.display = admin ? 'none' : 'block';
  if (adminNav) adminNav.style.display = admin ? 'block' : 'none';

  // Show correct initial tab
  if (admin) {
    document.querySelectorAll('.dashboard-tab').forEach(t => t.style.display = 'none');
    const adminTab = document.getElementById('tab-todos-orcamentos');
    if (adminTab) adminTab.style.display = 'block';
    // Mark first admin nav link as active
    adminNav?.querySelectorAll('.sidebar-link').forEach((l, i) => l.classList.toggle('active', i === 0));
  }

  // Logout
  document.getElementById('btn-logout')?.addEventListener('click', () => { clearAuth(); window.location.href = '/'; });

  // New quote button
  document.getElementById('btn-novo-orcamento')?.addEventListener('click', () => window.location.href = '/contato.html');
}

// === STATUS BADGE ===
function statusBadge(status) {
  const map = { pendente: 'Pendente', em_analise: 'Em Análise', aprovado: 'Aprovado', rejeitado: 'Rejeitado' };
  const cls = { pendente: 'badge-pendente', em_analise: 'badge-analise', aprovado: 'badge-aprovado', rejeitado: 'badge-rejeitado' };
  return `<span class="badge ${cls[status] || ''}">${map[status] || status}</span>`;
}

// === USER DASHBOARD ===
let myQuotes = [];

async function loadUserDashboard() {
  try {
    const res = await quotesApi.myQuotes();
    const quotes = res.data || [];
    myQuotes = quotes;
    // Stats
    const total = quotes.length;
    const analise = quotes.filter(q => q.status === 'em_analise').length;
    const aprovado = quotes.filter(q => q.status === 'aprovado').length;
    const pendente = quotes.filter(q => q.status === 'pendente').length;
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-analise').textContent = analise;
    document.getElementById('stat-aprovado').textContent = aprovado;
    document.getElementById('stat-pendente').textContent = pendente;
    // Table
    const tbody = document.getElementById('quotes-tbody');
    if (!tbody) return;
    if (!quotes.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhum orçamento enviado.</td></tr>'; return; }
    tbody.innerHTML = quotes.map(q => `
      <tr>
        <td>${(q.tipoServico || []).join(', ')}</td>
        <td class="text-muted">${q.descricao?.substring(0,40)}...</td>
        <td>${statusBadge(q.status)}</td>
        <td class="text-muted">${formatDate(q.createdAt)}</td>
        <td><button class="btn btn-primary btn-sm" onclick="openDetail('${q._id}')">Detalhes</button></td>
      </tr>
    `).join('');
  } catch(err) {
    showAlert(err.message || 'Erro ao carregar orçamentos');
  }
}

// === ADMIN DASHBOARD ===
let allQuotes = [];
let currentFilter = 'todos';
let searchQuery = '';

async function loadAdminDashboard() {
  try {
    const res = await quotesApi.list({ limit: 100 });
    allQuotes = res.data || [];
    renderAdminStats();
    renderAdminTable();
  } catch(err) {
    showAlert(err.message || 'Erro ao carregar orçamentos');
  }
}

function renderAdminStats() {
  const total = allQuotes.length;
  const analise = allQuotes.filter(q => q.status === 'em_analise').length;
  const aprovado = allQuotes.filter(q => q.status === 'aprovado').length;
  const pendente = allQuotes.filter(q => q.status === 'pendente').length;
  document.getElementById('admin-stat-total').textContent = total;
  document.getElementById('admin-stat-analise').textContent = analise;
  document.getElementById('admin-stat-aprovado').textContent = aprovado;
  document.getElementById('admin-stat-pendente').textContent = pendente;
}

function renderAdminTable() {
  const tbody = document.getElementById('admin-quotes-tbody');
  if (!tbody) return;
  let filtered = allQuotes;
  if (currentFilter !== 'todos') filtered = filtered.filter(q => q.status === currentFilter);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(q2 => q2.nomeCompleto?.toLowerCase().includes(q) || (q2.tipoServico || []).some(t => t.toLowerCase().includes(q)));
  }
  if (!filtered.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhum orçamento encontrado.</td></tr>'; return; }
  tbody.innerHTML = filtered.map(q => `
    <tr>
      <td>
        <div class="flex" style="gap:.75rem;align-items:center">
          <div class="avatar-sm">${getInitials(q.nomeCompleto)}</div>
          <span>${q.nomeCompleto}</span>
        </div>
      </td>
      <td>${(q.tipoServico || []).join(', ')}</td>
      <td>${statusBadge(q.status)}</td>
      <td class="text-muted">${formatDate(q.createdAt)}</td>
      <td>
        <div class="flex" style="gap:.5rem">
          <select class="status-select" data-id="${q._id}" onchange="changeStatus(this)">
            <option value="pendente" ${q.status==='pendente'?'selected':''}>Pendente</option>
            <option value="em_analise" ${q.status==='em_analise'?'selected':''}>Em Análise</option>
            <option value="aprovado" ${q.status==='aprovado'?'selected':''}>Aprovado</option>
            <option value="rejeitado" ${q.status==='rejeitado'?'selected':''}>Rejeitado</option>
          </select>
          <button class="btn btn-primary btn-sm" onclick="viewDetail('${q._id}')">Ver mais</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Filter tabs
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderAdminTable();
  });
});

// Search
document.getElementById('admin-search')?.addEventListener('input', e => {
  searchQuery = e.target.value;
  renderAdminTable();
});

// Change status
window.changeStatus = async function(select) {
  const id = select.dataset.id;
  const status = select.value;
  try {
    await quotesApi.updateStatus(id, status);
    const q = allQuotes.find(q => q._id === id);
    if (q) q.status = status;
    renderAdminStats();
    renderAdminTable();
    showAlert('Status atualizado!', 'success');
  } catch(err) {
    showAlert(err.message || 'Erro ao atualizar status');
  }
};

// View detail modal
window.viewDetail = function(id) {
  const q = allQuotes.find(q => q._id === id) || myQuotes.find(q => q._id === id);
  if (!q) return;
  const modal = document.getElementById('detail-modal');
  const content = document.getElementById('detail-content');
  if (!modal || !content) return;
  content.innerHTML = `
    <h3 style="margin-bottom:1rem">${q.nomeCompleto}</h3>
    <p><strong>Email:</strong> ${q.email}</p>
    <p><strong>Telefone:</strong> ${q.telefone}</p>
    <p><strong>Serviços:</strong> ${(q.tipoServico||[]).join(', ')}</p>
    <p><strong>Status:</strong> ${statusBadge(q.status)}</p>
    <p><strong>Data:</strong> ${formatDate(q.createdAt)}</p>
    <hr style="margin:1rem 0;border-color:var(--border)">
    <p><strong>Descrição:</strong></p>
    <p style="color:var(--text-mid);line-height:1.6">${q.descricao}</p>
  `;
  modal.style.display = 'flex';
};

window.openDetail = window.viewDetail;

document.getElementById('modal-close')?.addEventListener('click', () => {
  document.getElementById('detail-modal').style.display = 'none';
});
document.getElementById('detail-modal')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) e.currentTarget.style.display = 'none';
});

// === PROJETOS ===
let allProjects = [];

async function loadAdminProjetos() {
  try {
    const res = await projectsApi.list({ limit: 100 });
    allProjects = res.data || [];
    renderProjetosTable();
  } catch(err) { showAlert(err.message || 'Erro ao carregar projetos'); }
}

function renderProjetosTable() {
  const tbody = document.getElementById('projetos-tbody');
  if (!tbody) return;
  if (!allProjects.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum projeto cadastrado.</td></tr>';
    return;
  }
  tbody.innerHTML = allProjects.map(p => `
    <tr>
      <td><strong>${p.titulo}</strong></td>
      <td>${(p.categorias || []).join(', ')}</td>
      <td>${p.destaque ? '<span class="badge badge-aprovado">Sim</span>' : '<span class="badge" style="background:#f3f4f6;color:#6b7280">Não</span>'}</td>
      <td>
        <div class="flex" style="gap:.5rem">
          <button class="btn btn-primary btn-sm" onclick="openProjectModal('${p._id}')">Editar</button>
          <button class="btn btn-sm" style="background:#fee2e2;color:#dc2626;border:none;cursor:pointer" onclick="deleteProject('${p._id}')">Excluir</button>
        </div>
      </td>
    </tr>
  `).join('');
}

const CATEGORIAS = ['Consultoria', 'Desenvolvimento', 'Design', 'Marketing', 'Outro'];

window.openProjectModal = function(id) {
  const p = id ? allProjects.find(x => x._id === id) : null;
  const modal = document.getElementById('detail-modal');
  const content = document.getElementById('detail-content');
  const selCats = p?.categorias || [];
  content.innerHTML = `
    <h3 style="margin-bottom:1.25rem">${p ? 'Editar Projeto' : 'Novo Projeto'}</h3>
    <form id="project-form">
      <div class="form-group"><label>Título *</label>
        <input type="text" id="p-titulo" value="${p?.titulo || ''}" required></div>
      <div class="form-group"><label>Descrição *</label>
        <textarea id="p-descricao" rows="3" required>${p?.descricao || ''}</textarea></div>
      <div class="form-group"><label>Categorias</label>
        <div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.25rem">
          ${CATEGORIAS.map(c => `
            <label style="display:flex;align-items:center;gap:.35rem;cursor:pointer">
              <input type="checkbox" name="cat" value="${c}" ${selCats.includes(c) ? 'checked' : ''}> ${c}
            </label>
          `).join('')}
        </div>
      </div>
      <div class="form-group" style="display:flex;align-items:center;gap:.75rem">
        <input type="checkbox" id="p-destaque" ${p?.destaque ? 'checked' : ''}>
        <label for="p-destaque" style="margin:0">Projeto em destaque na home</label>
      </div>
      <div style="display:flex;gap:.75rem;margin-top:1.25rem">
        <button type="submit" class="btn btn-primary btn-block" id="save-project-btn">
          ${p ? 'Salvar alterações' : 'Criar projeto'}
        </button>
      </div>
    </form>
  `;
  modal.style.display = 'flex';
  document.getElementById('project-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('save-project-btn');
    const categorias = [...document.querySelectorAll('input[name="cat"]:checked')].map(cb => cb.value);
    const data = {
      titulo: document.getElementById('p-titulo').value.trim(),
      descricao: document.getElementById('p-descricao').value.trim(),
      categorias,
      destaque: document.getElementById('p-destaque').checked,
    };
    setLoading(btn, true);
    try {
      if (p) { await projectsApi.update(p._id, data); }
      else { await projectsApi.create(data); }
      modal.style.display = 'none';
      showAlert(p ? 'Projeto atualizado!' : 'Projeto criado!', 'success');
      await loadAdminProjetos();
    } catch(err) { showAlert(err.message || 'Erro ao salvar projeto'); }
    finally { setLoading(btn, false); }
  });
};

window.deleteProject = async function(id) {
  if (!confirm('Excluir este projeto? Ele será removido do portfólio.')) return;
  try {
    await projectsApi.delete(id);
    showAlert('Projeto excluído!', 'success');
    await loadAdminProjetos();
  } catch(err) { showAlert(err.message || 'Erro ao excluir'); }
};

// === EQUIPE ===
let allMembers = [];

async function loadAdminEquipe() {
  try {
    const res = await teamApi.list();
    allMembers = res.data || [];
    renderEquipeTable();
  } catch(err) { showAlert(err.message || 'Erro ao carregar equipe'); }
}

function renderEquipeTable() {
  const tbody = document.getElementById('equipe-tbody');
  if (!tbody) return;
  if (!allMembers.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum membro cadastrado.</td></tr>';
    return;
  }
  tbody.innerHTML = allMembers.map(m => `
    <tr>
      <td>
        <div class="flex" style="gap:.75rem;align-items:center">
          <div class="avatar-sm" style="background:${m.cor || '#2563eb'}">${getInitials(m.nome)}</div>
          <strong>${m.nome}</strong>
        </div>
      </td>
      <td>${m.cargo || ''}</td>
      <td>
        <div style="display:flex;align-items:center;gap:.5rem">
          <span style="display:inline-block;width:18px;height:18px;border-radius:50%;background:${m.cor || '#2563eb'};flex-shrink:0"></span>
          <span class="text-muted" style="font-size:.85rem">${m.cor || '#2563eb'}</span>
        </div>
      </td>
      <td>
        <div class="flex" style="gap:.5rem">
          <button class="btn btn-primary btn-sm" onclick="openMemberModal('${m._id}')">Editar</button>
          <button class="btn btn-sm" style="background:#fee2e2;color:#dc2626;border:none;cursor:pointer" onclick="deleteMember('${m._id}')">Excluir</button>
        </div>
      </td>
    </tr>
  `).join('');
}

window.openMemberModal = function(id) {
  const m = id ? allMembers.find(x => x._id === id) : null;
  const modal = document.getElementById('detail-modal');
  const content = document.getElementById('detail-content');
  content.innerHTML = `
    <h3 style="margin-bottom:1.25rem">${m ? 'Editar Membro' : 'Novo Membro'}</h3>
    <form id="member-form">
      <div class="form-group"><label>Nome Completo *</label>
        <input type="text" id="m-nome" value="${m?.nome || ''}" required></div>
      <div class="form-group"><label>Cargo *</label>
        <input type="text" id="m-cargo" value="${m?.cargo || ''}" required></div>
      <div class="form-group"><label>Cor do Avatar</label>
        <div style="display:flex;align-items:center;gap:.75rem;margin-top:.25rem">
          <input type="color" id="m-cor" value="${m?.cor || '#2563eb'}" style="height:40px;width:60px;border:none;cursor:pointer;border-radius:6px">
          <span class="text-muted" style="font-size:.85rem">Cor exibida no avatar em Sobre Nós</span>
        </div>
      </div>
      <div style="display:flex;gap:.75rem;margin-top:1.25rem">
        <button type="submit" class="btn btn-primary btn-block" id="save-member-btn">
          ${m ? 'Salvar alterações' : 'Adicionar membro'}
        </button>
      </div>
    </form>
  `;
  modal.style.display = 'flex';
  document.getElementById('member-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('save-member-btn');
    const data = {
      nome: document.getElementById('m-nome').value.trim(),
      cargo: document.getElementById('m-cargo').value.trim(),
      cor: document.getElementById('m-cor').value,
    };
    setLoading(btn, true);
    try {
      if (m) { await teamApi.update(m._id, data); }
      else { await teamApi.create(data); }
      modal.style.display = 'none';
      showAlert(m ? 'Membro atualizado!' : 'Membro adicionado!', 'success');
      await loadAdminEquipe();
    } catch(err) { showAlert(err.message || 'Erro ao salvar membro'); }
    finally { setLoading(btn, false); }
  });
};

window.deleteMember = async function(id) {
  if (!confirm('Remover este membro da equipe?')) return;
  try {
    await teamApi.delete(id);
    showAlert('Membro removido!', 'success');
    await loadAdminEquipe();
  } catch(err) { showAlert(err.message || 'Erro ao excluir'); }
};

// === INIT ===
initUI();

// Load data on tab click
document.querySelectorAll('.sidebar-link[data-tab]').forEach(link => {
  link.addEventListener('click', () => {
    const tab = link.dataset.tab;
    if (tab === 'projetos' && admin) loadAdminProjetos();
    if (tab === 'equipe' && admin) loadAdminEquipe();
  });
});

if (admin) {
  loadAdminDashboard();
} else {
  loadUserDashboard();
}
