import { quotesApi, Auth, showAlert, setLoading } from './api.js';

const btnLogin     = document.getElementById('btnLogin');
const btnPainel    = document.getElementById('btnPainel');
const btnVerPainel = document.getElementById('btnVerPainel');

if (Auth.isLoggedIn()) {
  if (btnLogin)     btnLogin.style.display     = 'none';
  if (btnPainel)    btnPainel.style.display    = 'inline-flex';
  if (btnVerPainel) btnVerPainel.style.display = 'inline-flex';
} else {
  if (btnVerPainel) btnVerPainel.style.display = 'none';
}

window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 20);
});

document.getElementById('navToggle')?.addEventListener('click', () => {
  document.getElementById('navLinks')?.classList.toggle('open');
});

const selectedServices = new Set();

document.querySelectorAll('#serviceChips .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const val = chip.dataset.value;
    if (selectedServices.has(val)) {
      selectedServices.delete(val);
      chip.classList.remove('selected');
    } else {
      selectedServices.add(val);
      chip.classList.add('selected');
    }
    document.getElementById('tipoServicoError')?.classList.remove('show');
  });
});

const descricaoEl = document.getElementById('descricao');
const charCountEl = document.getElementById('charCount');

descricaoEl?.addEventListener('input', () => {
  const len = descricaoEl.value.length;
  charCountEl.textContent = len;
  charCountEl.className   = len >= 50 ? 'enough' : '';
});

const telefoneEl = document.getElementById('telefone');
telefoneEl?.addEventListener('input', (e) => {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 6) {
    v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
  } else if (v.length > 2) {
    v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
  } else if (v.length > 0) {
    v = `(${v}`;
  }
  e.target.value = v;
});

function setError(id, msg) {
  const errEl = document.getElementById(id + 'Error');
  const input = document.getElementById(id);
  if (errEl) { errEl.textContent = msg; errEl.classList.toggle('show', !!msg); }
  if (input) input.classList.toggle('error', !!msg);
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(e => e.classList.remove('show'));
  document.querySelectorAll('.form-control').forEach(e => e.classList.remove('error'));
}

document.getElementById('orcamentoForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors();

  const nomeCompleto = document.getElementById('nomeCompleto').value.trim();
  const email        = document.getElementById('email').value.trim();
  const telefone     = document.getElementById('telefone').value.trim();
  const descricao    = document.getElementById('descricao').value.trim();
  const alert        = document.getElementById('alert');
  const btn          = document.getElementById('submitBtn');

  let valid = true;
  if (!nomeCompleto) { setError('nomeCompleto', 'Nome é obrigatório'); valid = false; }
  if (!email)        { setError('email', 'E-mail é obrigatório'); valid = false; }
  if (!telefone)     { setError('telefone', 'Telefone é obrigatório'); valid = false; }
  if (selectedServices.size === 0) {
    const errEl = document.getElementById('tipoServicoError');
    if (errEl) { errEl.textContent = 'Selecione pelo menos um serviço'; errEl.classList.add('show'); }
    valid = false;
  }
  if (!descricao || descricao.length < 20) {
    setError('descricao', 'Descreva o projeto (mínimo 20 caracteres)');
    valid = false;
  }
  if (!valid) return;

  try {
    setLoading(btn, true);
    await quotesApi.create({
      nomeCompleto,
      email,
      telefone,
      tipoServico: [...selectedServices],
      descricao,
    });

    document.getElementById('formState').style.display    = 'none';
    document.getElementById('successState').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) {
    setLoading(btn, false);
    const msg = err.data?.errors?.map(e => e.message).join(', ') || err.message || 'Erro ao enviar orçamento';
    showAlert(alert, msg, 'error');
  }
});
