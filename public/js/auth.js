import { authApi, Auth, showAlert, setLoading } from './api.js';
import { icons } from './icons.js';

if (Auth.isLoggedIn()) {
  window.location.href = '/painel.html';
}

function setFieldError(id, msg) {
  const el    = document.getElementById(id + 'Error');
  const input = document.getElementById(id);
  if (!el || !input) return;
  if (msg) {
    el.textContent = msg;
    el.classList.add('show');
    input.classList.add('error');
  } else {
    el.classList.remove('show');
    input.classList.remove('error');
  }
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));
  document.querySelectorAll('.form-control').forEach(e => e.classList.remove('error'));
}

document.querySelectorAll('[id^="toggleSenha"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling || document.getElementById('senha');
    if (input.type === 'password') {
      input.type = 'text';
      btn.innerHTML = icons.eyeOff;
    } else {
      input.type = 'password';
      btn.innerHTML = icons.eye;
    }
  });
});

const senhaInput    = document.getElementById('senha');
const strengthFill  = document.getElementById('strengthFill');
const strengthLabel = document.getElementById('strengthLabel');

if (senhaInput && strengthFill) {
  senhaInput.addEventListener('input', () => {
    const val = senhaInput.value;
    let score = 0;
    if (val.length >= 8)          score++;
    if (/[A-Z]/.test(val))        score++;
    if (/[0-9]/.test(val))        score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const colors = ['#ef4444', '#f59e0b', '#22c55e', '#16a34a'];
    const labels = ['Fraca', 'Média', 'Boa', 'Forte'];
    const widths = ['25%', '50%', '75%', '100%'];

    if (val.length === 0) {
      strengthFill.style.width  = '0';
      strengthLabel.textContent = '';
    } else {
      const idx = Math.min(score - 1, 3);
      strengthFill.style.width      = widths[idx] || '25%';
      strengthFill.style.background = colors[idx] || colors[0];
      strengthLabel.textContent     = labels[idx] || labels[0];
      strengthLabel.style.color     = colors[idx] || colors[0];
    }
  });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const alert = document.getElementById('alert');
    const btn   = document.getElementById('submitBtn');

    let valid = true;
    if (!email) { setFieldError('email', 'E-mail é obrigatório'); valid = false; }
    if (!senha) { setFieldError('senha', 'Senha é obrigatória');  valid = false; }
    if (!valid) return;

    try {
      setLoading(btn, true);
      const data = await authApi.login({ email, senha });

      Auth.setToken(data.data.token);
      Auth.setUser(data.data.user);

      window.location.href = '/painel.html';
    } catch (err) {
      setLoading(btn, false);
      showAlert(alert, err.message || 'Credenciais inválidas', 'error');
    }
  });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const nomeCompleto   = document.getElementById('nomeCompleto').value.trim();
    const email          = document.getElementById('email').value.trim();
    const senha          = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmarSenha').value;
    const termos         = document.getElementById('termos').checked;
    const alert          = document.getElementById('alert');
    const btn            = document.getElementById('submitBtn');

    let valid = true;
    if (!nomeCompleto)            { setFieldError('nomeCompleto', 'Nome é obrigatório'); valid = false; }
    if (!email)                   { setFieldError('email', 'E-mail é obrigatório'); valid = false; }
    if (senha.length < 8)         { setFieldError('senha', 'Senha deve ter ao menos 8 caracteres'); valid = false; }
    if (senha !== confirmarSenha) { setFieldError('confirmarSenha', 'As senhas não conferem'); valid = false; }
    if (!termos)                  { setFieldError('termos', 'Você deve aceitar os termos'); valid = false; }
    if (!valid) return;

    try {
      setLoading(btn, true);
      const data = await authApi.register({ nomeCompleto, email, senha });

      Auth.setToken(data.data.token);
      Auth.setUser(data.data.user);

      window.location.href = '/painel.html';
    } catch (err) {
      setLoading(btn, false);
      showAlert(alert, err.message || 'Erro ao criar conta', 'error');
    }
  });
}
