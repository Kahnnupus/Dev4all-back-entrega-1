import { authApi, setAuth, isLoggedIn, clearAuth, showAlert, setLoading } from './api.js';

// Redirect if already logged in
if (isLoggedIn()) window.location.href = '/painel.html';

// Login form
document.getElementById('form-login')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  const email = document.getElementById('login-email').value.trim();
  const senha = document.getElementById('login-senha').value;
  if (!email || !senha) return showAlert('Preencha todos os campos');
  setLoading(btn, true);
  try {
    const res = await authApi.login(email, senha);
    setAuth(res.data.token, res.data.user);
    window.location.href = '/painel.html';
  } catch(err) {
    showAlert(err.message || 'Email ou senha incorretos');
  } finally { setLoading(btn, false); }
});

// Register form
document.getElementById('form-registro')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  const nome = document.getElementById('reg-nome').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const senha = document.getElementById('reg-senha').value;
  const confirmar = document.getElementById('reg-confirmar').value;
  if (!nome || !email || !senha) return showAlert('Preencha todos os campos');
  if (senha !== confirmar) return showAlert('As senhas não coincidem');
  if (senha.length < 8) return showAlert('Senha deve ter no mínimo 8 caracteres');
  setLoading(btn, true);
  try {
    const res = await authApi.register(nome, email, senha);
    setAuth(res.data.token, res.data.user);
    window.location.href = '/painel.html';
  } catch(err) {
    showAlert(err.message || 'Erro ao criar conta');
  } finally { setLoading(btn, false); }
});

// Forgot password form (in esqueci-senha.html)
document.getElementById('form-forgot')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  const email = document.getElementById('forgot-email').value.trim();
  if (!email) return showAlert('Digite seu e-mail');
  setLoading(btn, true);
  try {
    await authApi.forgotPassword(email);
    showAlert('Se este e-mail existir, você receberá as instruções em breve.', 'success');
    e.target.reset();
  } catch {
    showAlert('Se este e-mail existir, você receberá as instruções em breve.', 'success');
  } finally { setLoading(btn, false); }
});
