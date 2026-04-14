import { authApi, setAuth, isLoggedIn, showAlert, setLoading } from './api.js';

if (isLoggedIn()) window.location.href = '/painel.html';

const senhaInput    = document.getElementById('reg-senha');
const confirmarInput = document.getElementById('reg-confirmar');
const pwdBar        = document.getElementById('pwd-bar');
const chkLen        = document.getElementById('chk-len');
const chkUpper      = document.getElementById('chk-upper');
const chkNumber     = document.getElementById('chk-number');
const matchMsg      = document.getElementById('pwd-match-msg');

function checkCriteria(senha) {
  return {
    len:   senha.length >= 8,
    upper: /[A-Z]/.test(senha),
    num:   /[0-9]/.test(senha),
  };
}

function updateStrength(senha) {
  const c = checkCriteria(senha);
  const score = [c.len, c.upper, c.num].filter(Boolean).length;

  setChk(chkLen,   c.len);
  setChk(chkUpper, c.upper);
  setChk(chkNumber, c.num);

  const colors = ['', '#ef4444', '#f59e0b', '#22c55e'];
  const widths  = ['0%', '33%', '66%', '100%'];
  pwdBar.style.width      = senha.length ? widths[score] : '0%';
  pwdBar.style.background = senha.length ? colors[score] : '';
}

function setChk(el, ok) {
  el.classList.toggle('ok', ok);
  el.querySelector('i').className = ok
    ? 'fa-solid fa-circle-check'
    : 'fa-solid fa-circle-xmark';
}

function updateMatch() {
  const senha    = senhaInput.value;
  const confirmar = confirmarInput.value;
  if (!confirmar) { matchMsg.style.display = 'none'; return; }
  matchMsg.style.display = 'flex';
  if (senha === confirmar) {
    matchMsg.className = 'pwd-match-msg ok';
    matchMsg.innerHTML = '<i class="fa-solid fa-circle-check"></i> Senhas coincidem';
  } else {
    matchMsg.className = 'pwd-match-msg err';
    matchMsg.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Senhas não coincidem';
  }
}

senhaInput?.addEventListener('input', () => {
  updateStrength(senhaInput.value);
  if (confirmarInput.value) updateMatch();
});

confirmarInput?.addEventListener('input', updateMatch);

document.getElementById('form-registro')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn       = e.target.querySelector('[type=submit]');
  const nome      = document.getElementById('reg-nome').value.trim();
  const email     = document.getElementById('reg-email').value.trim();
  const senha     = senhaInput.value;
  const confirmar = confirmarInput.value;

  if (!nome || !email || !senha) return showAlert('Preencha todos os campos');
  if (senha.length < 8) return showAlert('Senha deve ter no mínimo 8 caracteres');
  if (senha !== confirmar) return showAlert('As senhas não coincidem');

  setLoading(btn, true);
  try {
    const res = await authApi.register(nome, email, senha);
    setAuth(res.data.token, res.data.user);
    window.location.href = '/painel.html';
  } catch(err) {
    showAlert(err.message || 'Erro ao criar conta');
  } finally { setLoading(btn, false); }
});
