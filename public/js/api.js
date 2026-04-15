// === AUTH STORAGE ===
export function getToken() { return localStorage.getItem('token'); }
export function getUser() { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } }
export function setAuth(token, user) { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); }
export function clearAuth() { localStorage.removeItem('token'); localStorage.removeItem('user'); }
export function isLoggedIn() { return !!getToken(); }
export function isAdmin() { const u = getUser(); return u?.role === 'admin'; }

// === HTTP CLIENT ===
async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch('/api' + path, { ...options, headers: { ...headers, ...options.headers } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Erro na requisição');
  return data;
}

// === API MODULES ===
export const authApi = {
  login: (email, senha) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),
  register: (nomeCompleto, email, senha) => request('/auth/register', { method: 'POST', body: JSON.stringify({ nomeCompleto, email, senha }) }),
  me: () => request('/auth/me'),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
};

export const projectsApi = {
  list: (params = {}) => { const q = new URLSearchParams(params).toString(); return request('/projects' + (q ? '?' + q : '')); },
  get: (id) => request('/projects/' + id),
  create: (data) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request('/projects/' + id, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request('/projects/' + id, { method: 'DELETE' }),
};

export const quotesApi = {
  list: (params = {}) => { const q = new URLSearchParams(params).toString(); return request('/quotes' + (q ? '?' + q : '')); },
  myQuotes: () => request('/quotes/my'),
  get: (id) => request('/quotes/' + id),
  track: (codigo) => request('/quotes/track/' + codigo),
  submit: (data) => request('/quotes', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status) => request('/quotes/' + id + '/status', { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id) => request('/quotes/' + id, { method: 'DELETE' }),
};

export const teamApi = {
  list: () => request('/team'),
  create: (data) => request('/team', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request('/team/' + id, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => request('/team/' + id, { method: 'DELETE' }),
};

// === UTILITIES ===
export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
export function getInitials(name = '') {
  return name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}
export function showAlert(msg, type = 'error', container = document.body) {
  const existing = container.querySelector('.alert-toast');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = 'alert-toast alert-' + type;
  el.textContent = msg;
  el.style.cssText = 'position:fixed;top:1.5rem;right:1.5rem;z-index:9999;padding:1rem 1.5rem;border-radius:10px;font-weight:500;font-size:14px;max-width:360px;box-shadow:0 4px 20px rgba(0,0,0,0.15);animation:fadeIn .3s ease;' + (type === 'error' ? 'background:#fee2e2;color:#dc2626;border:1px solid #fca5a5;' : 'background:#dcfce7;color:#16a34a;border:1px solid #86efac;');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}
export function setLoading(btn, loading) {
  if (loading) { btn.dataset.original = btn.textContent; btn.textContent = 'Aguarde...'; btn.disabled = true; }
  else { btn.textContent = btn.dataset.original || btn.textContent; btn.disabled = false; }
}
