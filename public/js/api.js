const BASE = '/api';

export const Auth = {
  getToken:    ()  => localStorage.getItem('d4a_token'),
  setToken:    (t) => localStorage.setItem('d4a_token', t),
  removeToken: ()  => localStorage.removeItem('d4a_token'),
  getUser:     ()  => { try { return JSON.parse(localStorage.getItem('d4a_user')); } catch { return null; } },
  setUser:     (u) => localStorage.setItem('d4a_user', JSON.stringify(u)),
  removeUser:  ()  => localStorage.removeItem('d4a_user'),
  isLoggedIn:  ()  => !!Auth.getToken(),
  isAdmin:     ()  => Auth.getUser()?.role === 'admin',
  logout:      ()  => {
    Auth.removeToken();
    Auth.removeUser();
    window.location.href = '/login.html';
  },
};

async function request(path, opts = {}) {
  const token = Auth.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  };

  const config = { ...opts, headers };

  if (opts.body && typeof opts.body !== 'string') {
    config.body = JSON.stringify(opts.body);
  }

  const res = await fetch(BASE + path, config);
  let data;

  try {
    data = await res.json();
  } catch {
    data = { message: 'Resposta inválida do servidor' };
  }

  if (!res.ok) {
    const err = new Error(data.message || `Erro ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  get:    (path, opts = {})       => request(path, { method: 'GET', ...opts }),
  post:   (path, body, opts = {}) => request(path, { method: 'POST', body, ...opts }),
  patch:  (path, body, opts = {}) => request(path, { method: 'PATCH', body, ...opts }),
  delete: (path, opts = {})       => request(path, { method: 'DELETE', ...opts }),
};

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
};

export const projectsApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/projects${qs ? '?' + qs : ''}`);
  },
  get:    (id)       => api.get(`/projects/${id}`),
  create: (data)     => api.post('/projects', data),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  delete: (id)       => api.delete(`/projects/${id}`),
};

export const quotesApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/quotes${qs ? '?' + qs : ''}`);
  },
  my:           ()           => api.get('/quotes/my'),
  get:          (id)         => api.get(`/quotes/${id}`),
  create:       (data)       => api.post('/quotes', data),
  updateStatus: (id, status) => api.patch(`/quotes/${id}/status`, { status }),
  delete:       (id)         => api.delete(`/quotes/${id}`),
};

export const teamApi = {
  list:   ()         => api.get('/team'),
  get:    (id)       => api.get(`/team/${id}`),
  create: (data)     => api.post('/team', data),
  update: (id, data) => api.patch(`/team/${id}`, data),
  delete: (id)       => api.delete(`/team/${id}`),
};

export function showAlert(el, message, type = 'error') {
  el.textContent = message;
  el.className = `alert alert-${type} show`;
  setTimeout(() => el.classList.remove('show'), 5000);
}

export function setLoading(btn, loading) {
  if (loading) {
    btn._originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';
  } else {
    btn.disabled = false;
    btn.innerHTML = btn._originalText || btn.innerHTML;
  }
}

export function formatDate(dateStr) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(dateStr));
}

export function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}
