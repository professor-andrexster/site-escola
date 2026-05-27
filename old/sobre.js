function toggleMenu() {
    document.getElementById('nav-menu').classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', function() {
    // Menu móvel/teclado
    const mobileMenu = document.querySelector('.mobile-menu');
    mobileMenu.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMenu(); }
    });

    // Fechar em resize desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) document.getElementById('nav-menu').classList.remove('show');
    });

    // Scroll-to-Top
    const scrollTopBtn = document.getElementById('scroll-top');
    window.addEventListener('scroll', () => scrollTopBtn.classList.toggle('show', window.scrollY > 300));
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Fechar menu em links
    document.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => document.getElementById('nav-menu').classList.remove('show')));

    // Smooth scroll âncoras (SEO/UX)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Lazy loading imagens (performance ética)
    if ('loading' in HTMLImageElement.prototype) {
        document.querySelectorAll('img').forEach(img => img.loading = 'lazy');
    }

    // Animação timeline em scroll (detalhamento visual)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.style.opacity = '1'; // Fade-in itens
        });
    });
    document.querySelectorAll('.timeline-item').forEach(item => observer.observe(item));
});/* Mesmo JS anterior, com adição para biografia fade */
document.querySelectorAll('#historia h4').forEach(el => el.style.transition = 'opacity 0.5s');