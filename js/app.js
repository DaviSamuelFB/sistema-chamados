/**
 * app.js
 * Lógica frontend: validações JS e chamadas AJAX (fetch)
 * Sistema de Chamados - TMS1391 - Desenvolvimento Web
 */

/* ============================================================
   UTILITÁRIOS
   ============================================================ */

/** Mostra ou esconde um alerta na tela */
function showAlert(elId, msg, tipo = 'erro') {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = msg;
  el.className = `alert-box show alert-${tipo}`;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideAlert(elId) {
  const el = document.getElementById(elId);
  if (el) el.className = 'alert-box';
}

function setFieldError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg || '';
  el.classList.toggle('show', !!msg);
}

/** Marca um campo com borda vermelha e insere span de erro abaixo dele */
function markFieldError(inputId, msg) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.classList.add('input-erro');
  const anchor = input.closest('.password-wrapper') || input;
  anchor.parentElement.querySelectorAll(`.label-erro[data-for="${inputId}"]`).forEach(s => s.remove());
  const span = document.createElement('span');
  span.className = 'label-erro';
  span.dataset.for = inputId;
  span.textContent = msg;
  anchor.insertAdjacentElement('afterend', span);
}

/** Remove marca de erro visual de um campo */
function clearFieldError(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  input.classList.remove('input-erro');
  const anchor = input.closest('.password-wrapper') || input;
  anchor.parentElement.querySelectorAll(`.label-erro[data-for="${inputId}"]`).forEach(s => s.remove());
}

function setCrit(id, ok) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('ok', ok);
  el.classList.toggle('err', !ok);
  el.querySelector('.crit-icon').textContent = ok ? '✓' : '✗';
}

/** Formata CPF enquanto o usuário digita */
function formatCPF(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  input.value = v;
}

/** Formata Telefone enquanto o usuário digita */
function formatTelefone(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 11);
  if (v.length >= 7) {
    v = v.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  } else if (v.length >= 3) {
    v = v.replace(/^(\d{2})(\d+)/, '($1) $2');
  }
  input.value = v;
}

/** Valida e-mail simples */
function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Valida Telefone: 10 (fixo) ou 11 (celular) dígitos, sem sequência repetida */
function validarTelefone(telefone) {
  const d = telefone.replace(/\D/g, '');
  if (d.length !== 10 && d.length !== 11) return false;
  return !/^(\d)\1+$/.test(d);
}

/** Valida CPF: 11 dígitos, sem sequência repetida, dois dígitos verificadores oficiais */
function validarCPF(cpf) {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(d[i]) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(d[9])) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(d[i]) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(d[10]);
}

/** Retorna badge HTML conforme status */
function badgeStatus(status) {
  const mapa = {
    'Em aberto': 'badge-aberto',
    'Em análise': 'badge-analise',
    'Resolvido': 'badge-resolvido',
  };
  const cls = mapa[status] || 'badge-aberto';
  return `<span class="badge-status ${cls}">${status}</span>`;
}

/* ============================================================
   TELA: INDEX (Página inicial)
   ============================================================ */
function initIndex() {
  document.getElementById('btnEntrar')?.addEventListener('click', () => {
    window.location.href = 'login.html';
  });
  document.getElementById('btnCadastrar')?.addEventListener('click', () => {
    window.location.href = 'cadastro.html';
  });
}

/* ============================================================
   TELA: LOGIN
   ============================================================ */
function initLogin() {
  const form = document.getElementById('formLogin');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert('alertLogin');

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;

    // ── Validações frontend ──
    if (!email || !senha) {
      showAlert('alertLogin', 'Preencha todos os campos.');
      return;
    }
    if (!validarEmail(email)) {
      showAlert('alertLogin', 'Informe um e-mail válido (ex: usuario@dominio.com).');
      return;
    }

    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Entrando…';

    try {
      const resp = await fetch('php/auth.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, senha }),
      });
      const data = await resp.json();

      if (data.sucesso) {
        window.location.href = 'dashboard.html';
      } else {
        showAlert('alertLogin', 'E-mail ou senha incorretos.');
      }
    } catch {
      showAlert('alertLogin', 'Erro de conexão. Tente novamente.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
}

/* ============================================================
   TELA: CADASTRO
   ============================================================ */
function initCadastro() {
  const form = document.getElementById('formCadastro');
  if (!form) return;

  // Máscaras em tempo real
  document.getElementById('cpf')?.addEventListener('input', (e) => formatCPF(e.target));
  document.getElementById('telefone')?.addEventListener('input', (e) => formatTelefone(e.target));

  // Critérios de senha em tempo real
  const senhaInput = document.getElementById('senha');
  senhaInput?.addEventListener('input', () => {
    const v = senhaInput.value;
    document.getElementById('pwdCriteria')?.classList.toggle('show', v.length > 0);
    setCrit('critLen', v.length >= 8);
    setCrit('critNum', /\d/.test(v));
    setCrit('critLtr', /[a-zA-Z]/.test(v));
  });

  // Validação inline por campo (no blur / input)
  document.getElementById('email')?.addEventListener('blur', () => {
    const val = document.getElementById('email').value.trim();
    setFieldError('erroEmail', val && !validarEmail(val) ? 'Informe um e-mail válido.' : '');
  });
  document.getElementById('telefone')?.addEventListener('blur', () => {
    const val = document.getElementById('telefone').value.trim();
    if (!val) { clearFieldError('telefone'); return; }
    if (!validarTelefone(val)) {
      markFieldError('telefone', 'Informe um telefone válido com DDD ex: (11) 98765-4321');
    } else {
      clearFieldError('telefone');
    }
  });
  document.getElementById('cpf')?.addEventListener('blur', () => {
    const val = document.getElementById('cpf').value.trim();
    setFieldError('erroCPF', '');
    if (!val) { clearFieldError('cpf'); return; }
    if (!validarCPF(val)) {
      markFieldError('cpf', 'CPF inválido. Verifique os números digitados.');
    } else {
      clearFieldError('cpf');
    }
  });
  document.getElementById('confirmarSenha')?.addEventListener('input', () => {
    const s = document.getElementById('senha').value;
    const c = document.getElementById('confirmarSenha').value;
    if (c) setFieldError('erroConfirmaSenha', s !== c ? 'As senhas não coincidem.' : '');
  });

  // Ao digitar, remove a marcação de erro visual gerada no submit
  ['nome', 'email', 'telefone', 'cpf', 'senha', 'confirmarSenha'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', () => clearFieldError(id));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert('alertCadastro');

    // Limpa erros do sistema legado e do novo sistema
    setFieldError('erroEmail', '');
    setFieldError('erroCPF', '');
    setFieldError('erroConfirmaSenha', '');
    ['nome', 'email', 'telefone', 'cpf', 'senha', 'confirmarSenha'].forEach(clearFieldError);

    const nome     = document.getElementById('nome').value.trim();
    const email    = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const cpf      = document.getElementById('cpf').value.trim();
    const senha    = document.getElementById('senha').value;
    const confirma = document.getElementById('confirmarSenha').value;

    // ── Validações por campo — coleta todos os erros antes de exibir ──
    let temErro = false;

    if (!nome) {
      markFieldError('nome', 'Nome completo é obrigatório.');
      temErro = true;
    }
    if (!email || !validarEmail(email)) {
      markFieldError('email', email ? 'Informe um e-mail válido (ex: usuario@dominio.com).' : 'E-mail é obrigatório.');
      temErro = true;
    }
    if (!telefone || !validarTelefone(telefone)) {
      markFieldError('telefone', telefone ? 'Informe um telefone válido com DDD ex: (11) 98765-4321)' : 'Telefone é obrigatório.');
      temErro = true;
    }
    if (!cpf || !validarCPF(cpf)) {
      markFieldError('cpf', cpf ? 'CPF inválido. Verifique os números digitados.' : 'CPF é obrigatório.');
      temErro = true;
    }
    if (!senha || senha.length < 8 || !/\d/.test(senha) || !/[a-zA-Z]/.test(senha)) {
      markFieldError('senha', 'A senha não atende aos critérios exigidos.');
      temErro = true;
    }
    if (!confirma || senha !== confirma) {
      markFieldError('confirmarSenha', confirma ? 'As senhas não coincidem.' : 'Confirme sua senha.');
      temErro = true;
    }

    if (temErro) {
      showAlert('alertCadastro', 'Verifique os campos destacados.');
      return;
    }

    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Cadastrando…';

    try {
      const resp = await fetch('php/usuarios.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cadastrar', nome, email, telefone, cpf, senha }),
      });
      const data = await resp.json();

      if (data.sucesso) {
        showAlert('alertCadastro', 'Cadastro realizado com sucesso! Redirecionando…', 'ok');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
      } else {
        showAlert('alertCadastro', data.erro || 'Erro ao realizar cadastro.');
      }
    } catch {
      showAlert('alertCadastro', 'Erro de conexão. Tente novamente.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Cadastrar';
    }
  });
}

/* ============================================================
   TELA: DASHBOARD (Área do usuário)
   ============================================================ */
function initDashboard() {
  carregarDashboard();

  document.getElementById('btnEditarDados')?.addEventListener('click', abrirModalEditar);
  document.getElementById('btnNovoChamado')?.addEventListener('click', () => {
    window.location.href = 'chamados.html?acao=novo';
  });
  document.getElementById('btnVerChamados')?.addEventListener('click', () => {
    window.location.href = 'chamados.html';
  });
  document.getElementById('btnLogout')?.addEventListener('click', fazerLogout);
}

async function carregarDashboard() {
  try {
    // Verifica sessão e carrega dados do usuário
    const respAuth = await fetch('php/auth.php?action=check');
    const auth = await respAuth.json();

    if (!auth.autenticado) {
      window.location.href = 'login.html';
      return;
    }

    const u = auth.usuario;
    document.getElementById('nomeUsuario').textContent  = u.nome.split(' ')[0];
    document.getElementById('dadoNome').textContent     = u.nome;
    document.getElementById('dadoEmail').textContent    = u.email;
    document.getElementById('dadoTelefone').textContent = u.telefone;
    document.getElementById('dadoCPF').textContent      = u.cpf;

    // Carrega contagens de chamados
    const respCh = await fetch('php/chamados.php?action=listar');
    const ch = await respCh.json();

    if (ch.sucesso) {
      document.getElementById('qtdAbertos').textContent = ch.total_abertos;
      document.getElementById('qtdTotal').textContent   = ch.total;
    }
  } catch {
    console.error('Erro ao carregar dashboard.');
  }
}

/* ============================================================
   MODAL: Editar dados do usuário
   ============================================================ */
function abrirModalEditar() {
  const modal = document.getElementById('modalEditar');
  if (modal) modal.classList.add('show');
}

function fecharModalEditar() {
  const modal = document.getElementById('modalEditar');
  if (modal) modal.classList.remove('show');
}

function initModalEditar() {
  const form = document.getElementById('formEditar');
  if (!form) return;

  // Pré-preenche campos com dados atuais da tela
  document.getElementById('editNome').value     = document.getElementById('dadoNome')?.textContent     || '';
  document.getElementById('editEmail').value    = document.getElementById('dadoEmail')?.textContent    || '';
  document.getElementById('editTelefone').value = document.getElementById('dadoTelefone')?.textContent || '';
  document.getElementById('editCPF').value      = document.getElementById('dadoCPF')?.textContent      || '';

  document.getElementById('editCPF')?.addEventListener('input', (e) => formatCPF(e.target));
  document.getElementById('editTelefone')?.addEventListener('input', (e) => formatTelefone(e.target));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert('alertEditar');

    const nome     = document.getElementById('editNome').value.trim();
    const email    = document.getElementById('editEmail').value.trim();
    const telefone = document.getElementById('editTelefone').value.trim();
    const cpf      = document.getElementById('editCPF').value.trim();
    const senha    = document.getElementById('editSenha').value;

    if (!nome || !email || !telefone || !cpf) {
      showAlert('alertEditar', 'Preencha todos os campos obrigatórios.');
      return;
    }
    if (!validarEmail(email)) {
      showAlert('alertEditar', 'E-mail inválido.');
      return;
    }
    if (!validarCPF(cpf)) {
      showAlert('alertEditar', 'CPF inválido. Informe 11 dígitos.');
      return;
    }

    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Salvando…';

    try {
      const resp = await fetch('php/usuarios.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'editar', nome, email, telefone, cpf, senha }),
      });
      const data = await resp.json();

      if (data.sucesso) {
        // Atualiza dados na tela sem reload completo
        document.getElementById('dadoNome').textContent     = nome;
        document.getElementById('dadoEmail').textContent    = email;
        document.getElementById('dadoTelefone').textContent = telefone;
        document.getElementById('dadoCPF').textContent      = cpf;
        document.getElementById('nomeUsuario').textContent  = nome.split(' ')[0];
        showAlert('alertEditar', 'Dados atualizados com sucesso!', 'ok');
        setTimeout(fecharModalEditar, 1500);
      } else {
        showAlert('alertEditar', data.erro || 'Erro ao atualizar dados.');
      }
    } catch {
      showAlert('alertEditar', 'Erro de conexão.');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Salvar alterações';
    }
  });
}

/* ============================================================
   TELA: CHAMADOS (lista + formulário)
   ============================================================ */
let chamadoEmEdicao = null;

function initChamados() {
  const params = new URLSearchParams(window.location.search);

  carregarListaChamados();

  document.getElementById('btnNovo')?.addEventListener('click', () => abrirModalChamado());
  document.getElementById('btnLogout')?.addEventListener('click', fazerLogout);
  document.getElementById('btnVoltar')?.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });

  // Abre formulário direto se vier com ?acao=novo
  if (params.get('acao') === 'novo') {
    setTimeout(() => abrirModalChamado(), 300);
  }

  // Formulário de chamado (modal)
  const formCh = document.getElementById('formChamado');
  if (formCh) {
    formCh.addEventListener('submit', salvarChamado);
  }
}

async function carregarListaChamados() {
  const lista = document.getElementById('listaChamados');
  if (!lista) return;

  lista.innerHTML = '<p style="color:var(--text-muted); font-size:.9rem;">Carregando…</p>';

  try {
    const resp = await fetch('php/chamados.php?action=listar');
    const data = await resp.json();

    if (!data.sucesso) {
      if (resp.status === 401) { window.location.href = 'login.html'; return; }
      lista.innerHTML = '<p style="color:red">Erro ao carregar chamados.</p>';
      return;
    }

    if (data.chamados.length === 0) {
      lista.innerHTML = '<p style="color:var(--text-muted); font-size:.9rem; text-align:center; padding:20px 0;">Nenhum chamado registrado ainda.<br>Clique em <strong>+ Novo</strong> para abrir seu primeiro chamado.</p>';
      return;
    }

    lista.innerHTML = data.chamados.map((ch, i) => `
      <div class="chamado-item" onclick="abrirModalChamado(${JSON.stringify(ch).replace(/"/g, '&quot;')})">
        <div class="chamado-item-top">
          <span class="chamado-titulo">#${String(i + 1).padStart(3, '0')} — ${ch.titulo}</span>
          ${badgeStatus(ch.status)}
        </div>
        <p class="chamado-desc">${ch.descricao}</p>
        <div class="chamado-meta">
          <span>${ch.departamento}</span>
          <span>·</span>
          <span>${ch.regiao}</span>
          <span>·</span>
          <span>Resp: ${ch.responsavel}</span>
        </div>
      </div>
    `).join('');
  } catch {
    lista.innerHTML = '<p style="color:red">Erro de conexão.</p>';
  }
}

function abrirModalChamado(chamado = null) {
  chamadoEmEdicao = chamado;
  const modal = document.getElementById('modalChamado');
  const titulo = document.getElementById('modalChamadoTitulo');
  const btnSalvar = document.getElementById('btnSalvarChamado');
  const statusGroup = document.getElementById('statusGroup');

  const form = document.getElementById('formChamado');
  form.reset();
  hideAlert('alertChamado');

  if (chamado) {
    // Modo edição
    if (titulo) titulo.textContent = 'Editar chamado';
    if (btnSalvar) btnSalvar.textContent = 'Salvar alterações';
    if (statusGroup) statusGroup.style.display = 'block';

    document.getElementById('chTitulo').value       = chamado.titulo;
    document.getElementById('chDescricao').value    = chamado.descricao;
    document.getElementById('chDepartamento').value = chamado.departamento;
    document.getElementById('chRegiao').value        = chamado.regiao;
    document.getElementById('chResponsavel').value  = chamado.responsavel;
    document.getElementById('chStatus').value        = chamado.status;
  } else {
    // Modo novo
    if (titulo) titulo.textContent = 'Abrir chamado';
    if (btnSalvar) btnSalvar.textContent = 'Cadastrar chamado';
    if (statusGroup) statusGroup.style.display = 'none'; // status é fixo "Em aberto" ao criar
  }

  modal?.classList.add('show');
}

function fecharModalChamado() {
  document.getElementById('modalChamado')?.classList.remove('show');
  chamadoEmEdicao = null;
}

async function salvarChamado(e) {
  e.preventDefault();
  hideAlert('alertChamado');

  const titulo       = document.getElementById('chTitulo').value.trim();
  const descricao    = document.getElementById('chDescricao').value.trim();
  const departamento = document.getElementById('chDepartamento').value;
  const regiao       = document.getElementById('chRegiao').value;
  const responsavel  = document.getElementById('chResponsavel').value.trim();
  const status       = chamadoEmEdicao
    ? document.getElementById('chStatus').value
    : 'Em aberto';

  if (!titulo || !descricao || !departamento || !regiao || !responsavel) {
    showAlert('alertChamado', 'Preencha todos os campos obrigatórios.');
    return;
  }

  const btn = document.getElementById('btnSalvarChamado');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>Salvando…';

  const payload = chamadoEmEdicao
    ? { action: 'editar', id: chamadoEmEdicao.id, titulo, descricao, departamento, regiao, responsavel, status }
    : { action: 'cadastrar', titulo, descricao, departamento, regiao, responsavel };

  try {
    const resp = await fetch('php/chamados.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await resp.json();

    if (data.sucesso) {
      showAlert('alertChamado', chamadoEmEdicao ? 'Chamado atualizado!' : 'Chamado aberto com sucesso!', 'ok');
      setTimeout(() => {
        fecharModalChamado();
        carregarListaChamados();
      }, 1200);
    } else {
      showAlert('alertChamado', data.erro || 'Erro ao salvar chamado.');
    }
  } catch {
    showAlert('alertChamado', 'Erro de conexão.');
  } finally {
    btn.disabled = false;
    btn.textContent = chamadoEmEdicao ? 'Salvar alterações' : 'Cadastrar chamado';
  }
}

/* ============================================================
   LOGOUT
   ============================================================ */
async function fazerLogout() {
  await fetch('php/auth.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'logout' }),
  });
  window.location.href = 'index.html';
}

/* ============================================================
   INICIALIZAÇÃO AUTOMÁTICA POR PÁGINA
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  switch (page) {
    case 'index':     initIndex();    break;
    case 'login':     initLogin();    break;
    case 'cadastro':  initCadastro(); break;
    case 'dashboard':
      initDashboard();
      // Aguarda carregar dados para preencher o modal de editar
      setTimeout(initModalEditar, 800);
      break;
    case 'chamados':  initChamados(); break;
  }
});
