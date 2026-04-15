import { quotesApi, isLoggedIn, showAlert, setLoading } from './api.js';

const selectedServices = new Set();

// ── Real-time validation helpers ─────────────────────────────
function setFieldState(input, valid, msg) {
  const group = input.closest('.form-group');
  let hint = group.querySelector('.field-hint');
  if (!hint) { hint = document.createElement('span'); hint.className = 'field-hint'; group.appendChild(hint); }
  input.classList.toggle('input-error', !valid);
  input.classList.toggle('input-ok', valid);
  hint.textContent = valid ? '' : msg;
  hint.className = 'field-hint ' + (valid ? '' : 'hint-error');
}

function validateNome(v) { return v.trim().length >= 3; }
function validateEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); }
function validateTelefone(v) { return v.replace(/\D/g,'').length >= 10; }
function validateDescricao(v) { return v.trim().length >= 20; }

document.getElementById('contato-nome')?.addEventListener('blur', e => {
  setFieldState(e.target, validateNome(e.target.value), 'Nome deve ter ao menos 3 caracteres');
});
document.getElementById('contato-email')?.addEventListener('blur', e => {
  setFieldState(e.target, validateEmail(e.target.value), 'E-mail inválido');
});
document.getElementById('contato-telefone')?.addEventListener('blur', e => {
  setFieldState(e.target, validateTelefone(e.target.value), 'Telefone inválido');
});
document.getElementById('contato-descricao')?.addEventListener('input', e => {
  if (e.target.value.length > 5)
    setFieldState(e.target, validateDescricao(e.target.value), 'Mínimo de 20 caracteres');
});

// Chips multi-select
document.querySelectorAll('.service-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const val = chip.dataset.value;
    if (selectedServices.has(val)) { selectedServices.delete(val); chip.classList.remove('active'); }
    else { selectedServices.add(val); chip.classList.add('active'); }
  });
});

// Phone mask
document.getElementById('contato-telefone')?.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').substring(0, 11);
  if (v.length >= 7) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
  else if (v.length >= 3) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
  else if (v.length >= 1) v = `(${v}`;
  e.target.value = v;
});

// Clear form
document.getElementById('btn-limpar')?.addEventListener('click', () => {
  document.getElementById('form-contato')?.reset();
  selectedServices.clear();
  document.querySelectorAll('.service-chip').forEach(c => c.classList.remove('active'));
});

// Submit
document.getElementById('form-contato')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.target.querySelector('[type=submit]');
  const nomeCompleto = document.getElementById('contato-nome').value.trim();
  const email = document.getElementById('contato-email').value.trim();
  const telefone = document.getElementById('contato-telefone').value.trim();
  const descricao = document.getElementById('contato-descricao').value.trim();
  const tipoServico = [...selectedServices];
  if (!nomeCompleto || !email || !telefone) return showAlert('Preencha todos os campos obrigatórios');
  if (!tipoServico.length) return showAlert('Selecione ao menos um tipo de serviço');
  if (descricao.length < 20) return showAlert('Descrição deve ter ao menos 20 caracteres');
  setLoading(btn, true);
  try {
    const res = await quotesApi.submit({ nomeCompleto, email, telefone, tipoServico, descricao });
    const id = res.data?._id || Date.now();
    const proto = 'DEV' + new Date().getFullYear() + '-' + String(id).slice(-4).toUpperCase();
    const codigo = res.codigoRastreio || res.data?.codigoRastreio || '';
    window.location.href = `/confirmacao.html?protocolo=${proto}&codigo=${codigo}`;
  } catch(err) {
    showAlert(err.message || 'Erro ao enviar orçamento. Tente novamente.');
  } finally { setLoading(btn, false); }
});
