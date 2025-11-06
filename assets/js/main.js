/* main.js — Tillerstead
   - Responsive, accessible nav (focus trap, ESC, outside click, resize)
   - Theme toggle with system match + localStorage
   - Smooth anchor scrolling (respects reduced motion)
   - Static-host form handling (GitHub Pages) + Netlify passthrough
*/
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* =========================
     NAV: mobile drawer
  ========================= */
  const navToggle = $('.nav-toggle');
  const nav = $('#nav');
  let lastFocus = null;
  const BP_DESKTOP = 900; // px — adjust to your CSS breakpoint

  const openNav = () => {
    if (!nav) return;
    lastFocus = document.activeElement;
    nav.classList.add('open');
    navToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // focus first link for keyboard users
    const firstLink = $('a, button', nav);
    firstLink?.focus();
    document.addEventListener('keydown', trapFocus);
    document.addEventListener('click', outsideClick, { capture: true });
  };

  const closeNav = () => {
    if (!nav) return;
    nav.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', trapFocus);
    document.removeEventListener('click', outsideClick, { capture: true });
    (lastFocus || navToggle || document.body).focus?.();
  };

  const trapFocus = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeNav();
      return;
    }
    if (e.key !== 'Tab' || !nav?.classList.contains('open')) return;
    const focusables = $$('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', nav)
      .filter(el => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  };

  const outsideClick = (e) => {
    if (!nav?.classList.contains('open')) return;
    const header = $('.site-header');
    if (!header?.contains(e.target) && !nav.contains(e.target)) {
      closeNav();
    }
  };

  navToggle?.addEventListener('click', () => {
    (nav?.classList.contains('open') ? closeNav : openNav)();
  });

  // Close nav if resized to desktop
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth >= BP_DESKTOP) closeNav();
    }, 120);
  });

  /* =========================
     THEME: system + memory
     - toggles html.classList 'light'
  ========================= */
  const THEME_KEY = 'ts:theme';
  const themeBtn = $('.theme-toggle');

  const getSystemPref = () =>
    window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

  const applyTheme = (theme) => {
    const isLight = theme === 'light';
    document.documentElement.classList.toggle('light', isLight);
    themeBtn?.setAttribute('aria-pressed', String(isLight));
  };

  // init from storage or system
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || getSystemPref());

  // keep in sync with system changes (only if user hasn't chosen)
  if (!saved && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    mq.addEventListener?.('change', (e) => applyTheme(e.matches ? 'light' : 'dark'));
  }

  themeBtn?.addEventListener('click', () => {
    const isLight = document.documentElement.classList.toggle('light');
    const theme = isLight ? 'light' : 'dark';
    themeBtn.setAttribute('aria-pressed', String(isLight));
    localStorage.setItem(THEME_KEY, theme);
  });

  /* =========================
     SMOOTH SCROLL (anchors)
     - respects reduced motion
  ========================= */
  const prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const behavior = prefersReduced ? 'auto' : 'smooth';
    target.scrollIntoView({ behavior, block: 'start' });
    target.setAttribute('tabindex', '-1'); // focusable for a moment
    target.focus({ preventScroll: true });
    setTimeout(() => target.removeAttribute('tabindex'), 1000);
  });

  /* =========================
     CONTACT FORM (static hosts)
     - Netlify: normal POST
     - GitHub Pages: fake success
  ========================= */
  const contactForm = document.forms?.contact || $('[data-contact-form]');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      const isNetlify = !!(contactForm.getAttribute('data-netlify') || contactForm.action);
      if (isNetlify) return; // let Netlify handle it

      // GH Pages or local: intercept
      e.preventDefault();
      const submitBtn = $('button[type="submit"], input[type="submit"]', contactForm);
      submitBtn?.setAttribute('disabled', 'true');

      // Basic required check (optional: add more constraints)
      const invalid = $$('[required]', contactForm).find(el => !el.value?.trim());
      if (invalid) {
        alert('Please fill in all required fields.');
        submitBtn?.removeAttribute('disabled');
        invalid.focus();
        return;
      }

      // Simulated success (GH Pages)
      try {
        await new Promise(r => setTimeout(r, 250));
        alert('Thanks! Your message has been submitted.');
        contactForm.reset();
      } finally {
        submitBtn?.removeAttribute('disabled');
      }
    });
  }

  /* =========================
     MISC: close nav on in-page
     link click (mobile)
  ========================= */
  if (nav) {
    nav.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      // Close only if we clicked a link and we’re in mobile mode
      if (window.innerWidth < BP_DESKTOP) closeNav();
    });
  }
})();
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  document.body.classList.toggle('nav-open', open);
});
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);
  });

  // Close nav when clicking a link
  nav.addEventListener('click', (e) => {
    if (e.target.tagName.toLowerCase() === 'a') {
      nav.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
});
