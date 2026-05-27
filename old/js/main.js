// ── Informativo JB — main.js ─────────────────────────────────
// Integração com a API do backend (Node.js/Express + MySQL)
// Quando o backend não estiver disponível, o conteúdo estático
// do HTML já serve como fallback completo.
(function () {
  'use strict';

  // Em produção (Hostinger), troque pela URL do Railway após o deploy:
  // const API = 'https://SEU-PROJETO.up.railway.app/api';
  const API = '/api';

  // ── Busca notícias da API e renderiza no grid da home ──────
  async function carregarNoticiasHome() {
    const grid = document.getElementById('news-grid');
    if (!grid) return;

    try {
      const res = await fetch(`${API}/noticias?limit=6`);
      if (!res.ok) return; // mantém fallback estático
      const noticias = await res.json();
      if (!noticias.length) return;

      grid.innerHTML = noticias.map((n, i) => cardHTML(n, i === 0)).join('');
    } catch {
      // backend offline → conteúdo estático do HTML permanece
    }
  }

  // ── Busca notícias da API e renderiza na página de notícias ─
  async function carregarTodasNoticias() {
    const grid = document.getElementById('noticias-grid');
    if (!grid) return;

    try {
      const res = await fetch(`${API}/noticias?limit=30`);
      if (!res.ok) return;
      const noticias = await res.json();
      if (!noticias.length) return;

      grid.innerHTML = noticias.map((n, i) => cardHTML(n, i === 0)).join('');
    } catch {
      // mantém fallback estático
    }
  }

  // ── Gera HTML de um news-card ──────────────────────────────
  function cardHTML(n, destaque) {
    const tagClass = {
      esporte:    'tag-esporte',
      tecnologia: 'tag-tecnologia',
      cultura:    'tag-cultura',
      emti:       'tag-emti',
      projeto:    'tag-projeto',
      noticia:    'tag-noticia',
    }[n.categoria] || 'tag-noticia';

    const labelCat = {
      esporte: 'Esporte', tecnologia: 'Tecnologia', cultura: 'Cultura',
      emti: 'EMTI', projeto: 'Projeto', noticia: 'Geral',
    }[n.categoria] || 'Geral';

    const data = new Date(n.criado_em).toLocaleDateString('pt-BR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    const img = n.imagem_url
      ? `<img src="${n.imagem_url}" alt="${escHtml(n.titulo)}" onerror="this.src='images/fachada.jpg'" />`
      : `<img src="images/fachada.jpg" alt="Escola Estadual Dr. João Beraldo" />`;

    return `
      <article class="news-card${destaque ? ' destaque' : ''}" data-cat="${n.categoria}">
        <div class="news-image">${img}</div>
        <div class="news-content">
          <span class="tag ${tagClass}">${labelCat}</span>
          <h3>${escHtml(n.titulo)}</h3>
          <p>${escHtml(n.texto.substring(0, 160))}${n.texto.length > 160 ? '…' : ''}</p>
          <p class="news-meta mono">${data} · ${escHtml(n.autor)}</p>
          <a href="#" class="read-more">Leia mais <i class="fas fa-arrow-right"></i></a>
        </div>
      </article>`;
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── Animação de entrada nos cards ──────────────────────────
  function observarAnimacoes() {
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.news-card, .gallery-item, .pilar-card, .video-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
      obs.observe(el);
    });
  }

  // ── Init ───────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const pagina = window.location.pathname.split('/').pop();
    if (!pagina || pagina === 'index.html') carregarNoticiasHome();
    if (pagina === 'noticias.html') carregarTodasNoticias();

    setTimeout(observarAnimacoes, 200);
  });
})();
