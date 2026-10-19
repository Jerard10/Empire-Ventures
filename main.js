/* ==========================================================================
   EMPIRE VENTURES — home page behavior
   1. Mobile menu toggle
   2. Highlight the nav link for the section currently on screen
   3. Ambient falling-grain animation in the hero
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initScrollSpy();
    initGrains();
});

/* 1. Mobile menu ---------------------------------------------------------- */
function initMobileMenu() {
    const header = document.querySelector('.header');
    const toggle = document.querySelector('.nav-toggle');
    if (!header || !toggle) return;

    function setOpen(open) {
        header.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', () => setOpen(!header.classList.contains('open')));

    // Close after choosing a link, or when pressing Escape
    document.querySelectorAll('.nav-links').forEach(link => {
        link.addEventListener('click', () => setOpen(false));
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') setOpen(false);
    });
}

/* 2. Scroll spy ----------------------------------------------------------- */
function initScrollSpy() {
    const links = Array.from(document.querySelectorAll('.nav-links'));
    const targets = links
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);
    if (!targets.length || !('IntersectionObserver' in window)) return;

    // A section counts as "current" while it crosses the middle of the viewport
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            links.forEach(link => {
                const isCurrent = link.getAttribute('href') === '#' + entry.target.id;
                link.classList.toggle('active', isCurrent);
                if (isCurrent) link.setAttribute('aria-current', 'true');
                else link.removeAttribute('aria-current');
            });
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    targets.forEach(section => observer.observe(section));
}

/* 3. Falling grains ------------------------------------------------------- */
function initGrains() {
    const container = document.querySelector('.hero-grains');
    if (!container) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const count = window.matchMedia('(max-width: 700px)').matches ? 14 : 28;
    const rand = (min, max) => min + Math.random() * (max - min);

    for (let i = 0; i < count; i++) {
        const grain = document.createElement('i');
        grain.className = 'grain';

        const size = rand(8, 24);                       // bigger grains look closer...
        const duration = rand(16, 30) - size * 0.25;    // ...so they fall a little faster
        grain.style.setProperty('--x', rand(0, 100).toFixed(1) + '%');
        grain.style.setProperty('--w', size.toFixed(1) + 'px');
        grain.style.setProperty('--dur', duration.toFixed(1) + 's');
        grain.style.setProperty('--delay', '-' + rand(0, 30).toFixed(1) + 's'); // start mid-fall
        grain.style.setProperty('--r', rand(-40, 40).toFixed(0) + 'deg');
        grain.style.setProperty('--sway', rand(-60, 60).toFixed(0) + 'px');
        grain.style.setProperty('--o', (0.14 + size / 24 * 0.36).toFixed(2));
        container.appendChild(grain);
    }

    // Stop animating once the hero has scrolled out of view
    const hero = document.getElementById('home');
    if (hero && 'IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            container.classList.toggle('is-paused', !entry.isIntersecting);
        }).observe(hero);
    }
}
