(function () {
  // Injeta o modal no body
  var overlay = document.createElement('div');
  overlay.id = 'verificar-overlay';
  overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9998;align-items:center;justify-content:center;padding:1rem';
  overlay.innerHTML = [
    '<div style="background:#fff;border-radius:20px;padding:2rem;max-width:460px;width:100%;position:relative;box-shadow:0 24px 64px rgba(0,0,0,0.3)">',
      '<button onclick="fecharVerificar()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#9ca3af;padding:.25rem .5rem;border-radius:6px;line-height:1">&times;</button>',
      '<div style="text-align:center;margin-bottom:1.5rem">',
        '<div style="width:52px;height:52px;border-radius:50%;background:#eff6ff;display:flex;align-items:center;justify-content:center;margin:0 auto .75rem">',
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
        '</div>',
        '<h2 style="font-size:1.3rem;font-weight:800;color:#111827;margin:0 0 .35rem">Verificar Orçamento</h2>',
        '<p style="font-size:.875rem;color:#6b7280;margin:0">Digite o código de 6 dígitos recebido ao enviar o formulário</p>',
      '</div>',
      '<div style="display:flex;gap:.75rem;margin-bottom:1.25rem">',
        '<input id="vrf-codigo" type="text" maxlength="6" placeholder="Ex: 483921" inputmode="numeric" style="flex:1;padding:.75rem 1rem;border:1.5px solid #e5e7eb;border-radius:10px;font-size:1.1rem;font-weight:700;letter-spacing:.15em;text-align:center;outline:none">',
        '<button id="vrf-btn" onclick="buscarOrcamento()" style="background:#2563eb;color:#fff;border:none;border-radius:10px;padding:.75rem 1.25rem;font-weight:700;cursor:pointer;font-size:.9rem;white-space:nowrap">Buscar</button>',
      '</div>',
      '<div id="vrf-resultado" style="display:none"></div>',
    '</div>'
  ].join('');
  document.body.appendChild(overlay);

  // Fecha ao clicar fora
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) window.fecharVerificar();
  });

  // Fechar ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.style.display === 'flex') window.fecharVerificar();
  });

  // Enter no input
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && overlay.style.display === 'flex') window.buscarOrcamento();
  });

  // ── Funções públicas (definidas ANTES de vincular ao botão) ──

  window.abrirVerificar = function () {
    overlay.style.display = 'flex';
    document.getElementById('vrf-codigo').value = '';
    document.getElementById('vrf-resultado').style.display = 'none';
    setTimeout(function () { document.getElementById('vrf-codigo').focus(); }, 50);
  };

  window.fecharVerificar = function () {
    overlay.style.display = 'none';
  };

  window.buscarOrcamento = async function () {
    var codigo = document.getElementById('vrf-codigo').value.trim();
    var resultado = document.getElementById('vrf-resultado');
    var btn = document.getElementById('vrf-btn');

    if (!/^\d{6}$/.test(codigo)) {
      resultado.style.display = 'block';
      resultado.innerHTML = '<p style="color:#dc2626;font-size:.875rem;text-align:center;padding:.75rem;background:#fee2e2;border-radius:8px">Digite um código de 6 dígitos válido.</p>';
      return;
    }

    btn.textContent = 'Buscando...';
    btn.disabled = true;

    try {
      var resp = await fetch('/api/quotes/track/' + codigo);
      var json = await resp.json();

      if (!resp.ok || !json.success) {
        resultado.style.display = 'block';
        resultado.innerHTML = '<p style="color:#dc2626;font-size:.875rem;text-align:center;padding:.75rem;background:#fee2e2;border-radius:8px"><strong>Código não encontrado.</strong><br>Verifique se digitou corretamente.</p>';
        return;
      }

      var d = json.data;
      var statusMap = {
        pendente:   { label: 'Pendente',   bg: '#fef3c7', color: '#92400e' },
        em_analise: { label: 'Em Análise', bg: '#dbeafe', color: '#1e40af' },
        aprovado:   { label: 'Aprovado',   bg: '#d1fae5', color: '#065f46' },
        rejeitado:  { label: 'Rejeitado',  bg: '#fee2e2', color: '#991b1b' },
      };
      var s = statusMap[d.status] || { label: d.status, bg: '#f3f4f6', color: '#374151' };
      var dataFmt = new Date(d.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

      resultado.style.display = 'block';
      resultado.innerHTML = [
        '<div style="border:1.5px solid #e5e7eb;border-radius:12px;overflow:hidden;background:#fafafa">',
          // Header com nome + badge status
          '<div style="display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;background:#fff;border-bottom:1px solid #f3f4f6;gap:.5rem;flex-wrap:wrap">',
            '<span style="font-weight:700;color:#111827;font-size:1rem">' + esc(d.nomeCompleto) + '</span>',
            '<span style="background:' + s.bg + ';color:' + s.color + ';padding:.25rem .75rem;border-radius:999px;font-size:.8rem;font-weight:700;white-space:nowrap">' + s.label + '</span>',
          '</div>',
          // Dados
          '<div style="padding:1rem 1.25rem;display:grid;gap:.6rem">',
            row('E-mail', esc(d.email || '')),
            row('Telefone', esc(d.telefone || '')),
            row('Serviços', esc((d.tipoServico || []).join(', '))),
            row('Enviado em', dataFmt),
            row('Código', esc(d.codigoRastreio || '')),
          '</div>',
          // Descrição
          '<div style="padding:0 1.25rem 1rem">',
            '<p style="font-size:.75rem;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.4rem">Descrição</p>',
            '<p style="font-size:.85rem;color:#374151;line-height:1.6;margin:0;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:.75rem">' + esc(d.descricao || '') + '</p>',
          '</div>',
          // Footer
          '<div style="padding:.75rem 1.25rem;border-top:1px solid #f3f4f6;background:#fff">',
            '<p style="font-size:.75rem;color:#9ca3af;text-align:center;margin:0">',
              'Quer acompanhar pelo painel? ',
              '<a href="/login.html" style="color:#2563eb;font-weight:600">Faça login</a> ou ',
              '<a href="/registro.html" style="color:#2563eb;font-weight:600">crie uma conta</a>',
              ' com o e-mail do formulário.',
            '</p>',
          '</div>',
        '</div>'
      ].join('');
    } catch (err) {
      resultado.style.display = 'block';
      resultado.innerHTML = '<p style="color:#dc2626;font-size:.875rem;text-align:center;padding:.75rem;background:#fee2e2;border-radius:8px">Erro ao buscar. Tente novamente.</p>';
    } finally {
      btn.textContent = 'Buscar';
      btn.disabled = false;
    }
  };

  function esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function row(label, value) {
    return '<div style="display:flex;gap:.5rem;font-size:.82rem"><span style="color:#6b7280;min-width:80px;flex-shrink:0">' + label + ':</span><span style="color:#111827;font-weight:500;word-break:break-word">' + value + '</span></div>';
  }

  // Vincula ao botão da navbar (após as funções estarem definidas)
  var btn = document.getElementById('btn-verificar-orcamento');
  if (btn) {
    btn.addEventListener('click', function () { window.abrirVerificar(); });
  }
})();
