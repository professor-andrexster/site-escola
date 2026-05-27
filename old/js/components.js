// ── Carrega header e footer via fetch ────────────────────────
(function () {
  'use strict';

  function carregarComponente(id, arquivo) {
    const el = document.getElementById(id);
    if (!el) return;

    fetch(arquivo)
      .then(r => {
        if (!r.ok) throw new Error(`Erro ao carregar ${arquivo}`);
        return r.text();
      })
      .then(html => {
        el.innerHTML = html;
        if (id === 'main-header') ativarNavLink();
      })
      .catch(() => {
        // fallback inline caso fetch falhe (ex.: aberto como file://)
        if (id === 'main-header') el.innerHTML = headerFallback();
        if (id === 'main-footer') el.innerHTML = footerFallback();
        if (id === 'main-header') ativarNavLink();
      });
  }

  function ativarNavLink() {
    const pagina = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === pagina || (pagina === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });

    // Toggle mobile
    const toggle = document.querySelector('.mobile-menu-toggle');
    const menu   = document.querySelector('.nav-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', () => {
        const aberto = menu.classList.toggle('active');
        toggle.setAttribute('aria-expanded', aberto);
      });
    }
  }

  function headerFallback() {
    return `
      <div class="header-container">
        <div class="logo" style="display:none"></div>
        <nav aria-label="Navegação principal">
          <button class="mobile-menu-toggle" aria-label="Menu" aria-expanded="false">
            <i class="fas fa-bars"></i>
          </button>
          <ul class="nav-menu">
            <li><a href="index.html"       class="nav-link">Início</a></li>
            <li><a href="noticias.html"    class="nav-link">Notícias</a></li>
            <li><a href="emti.html"        class="nav-link">EMTI</a></li>
            <li><a href="cursos.html"      class="nav-link">Cursos</a></li>
            <li><a href="galeria.html"     class="nav-link">Galeria</a></li>
            <li><a href="professores.html" class="nav-link">Professores</a></li>
            <li><a href="contato.html"     class="nav-link">Contato</a></li>
          </ul>
        </nav>
      </div>`;
  }

  function footerFallback() {
    return `
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section">
            <h2>Informativo JB</h2>
            <p>Informativo da E.E. Dr. João Beraldo — Educação de qualidade formando cidadãos para o futuro.</p>
            <div class="social-links">
              <a href="https://www.facebook.com/share/1GrYbrPEvJ/" target="_blank" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
              <a href="https://www.instagram.com/escolajoaoberaldo" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="https://youtube.com/@joaoberaldocarloschagas" target="_blank" aria-label="YouTube"><i class="fab fa-youtube"></i></a>
            </div>
          </div>
          <div class="footer-section">
            <h3>Horário de Atendimento</h3>
            <ul class="footer-list">
              <li><strong>Secretaria: 7h às 22h</strong></li>
              <li><strong>Aulas: 7h às 22h</strong></li>
              <li>Segunda a Sexta-feira</li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>Contato</h3>
            <ul class="footer-list">
              <li><i class="fas fa-phone"></i> (33) 99870-1618</li>
              <li><i class="fas fa-envelope"></i> escola.146579.secretaria@educacao.mg.gov.br</li>
              <li><i class="fas fa-map-marker-alt"></i> Av. Gabriel Passos, 393 — Carlos Chagas/MG</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; ${new Date().getFullYear()} Informativo JB &mdash; E.E. Dr. João Beraldo</p>
        </div>
      </div>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    carregarComponente('main-header', 'components/header.html');
    carregarComponente('main-footer', 'components/footer.html');
  });
})();
