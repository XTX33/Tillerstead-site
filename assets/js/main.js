/* main.js — Tillerstead
   - Responsive, accessible nav (ESC, outside click, resize)
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
    const navToggle = $('.nav-toggle');      // matches your button class
  const nav = $('#site-nav');             // matches your nav id
  const header = $('.site-header');
  let lastFocus = null;
  const BP_DESKTOP = 900; // px — adjust to your CSS breakpoint

  const isNavOpen = () => nav?.classList.contains('is-open');

  const trapFocus = (e) => {
    if (!isNavOpen() || e.key !== 'Tab') return;

    const focusables = $$(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      nav
    ).filter((el) => el.offsetParent !== null);

    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const outsideClick = (e) => {
    if (!isNavOpen()) return;
    if (header?.contains(e.target) || nav.contains(e.target)) return;
    closeNav();
  };

  const openNav = () => {
    if (!nav) return;
    lastFocus = document.activeElement;
    nav.classList.add('is-open');
    navToggle?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');

    // focus first link for keyboard users
    const firstLink = $('a, button', nav);
    firstLink?.focus();

    document.addEventListener('keydown', trapFocus);
    document.addEventListener('keydown', onKeydownEsc);
    document.addEventListener('click', outsideClick, { capture: true });
  };

  const closeNav = () => {
    if (!nav) return;
    nav.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');

    document.removeEventListener('keydown', trapFocus);
    document.removeEventListener('keydown', onKeydownEsc);
    document.removeEventListener('click', outsideClick, { capture: true });

    (lastFocus || navToggle || document.body).focus?.();
  };

  const onKeydownEsc = (e) => {
    if (e.key === 'Escape' && isNavOpen()) {
      e.preventDefault();
      closeNav();
    }
  };

  navToggle?.addEventListener('click', () => {
    isNavOpen() ? closeNav() : openNav();
  });

  // Close nav on link click (mobile only)
  if (nav) {
    nav.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      if (window.innerWidth < BP_DESKTOP && isNavOpen()) {
        closeNav();
      }
    });
  }

  // Close nav if resized to desktop
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth >= BP_DESKTOP && isNavOpen()) {
        closeNav();
      }
    }, 120);
  });

  /* =========================
     THEME: system + memory
     - toggles html.classList 'light'
  ========================= */
  const THEME_KEY = 'ts:theme';
  const themeBtn = $('.theme-toggle');

  const getSystemPref = () =>
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';

  const applyTheme = (theme) => {
    const isLight = theme === 'light';
    document.documentElement.classList.toggle('light', isLight);
    themeBtn?.setAttribute('aria-pressed', String(isLight));
  };

  // init from storage or system
  let saved = null;
  try {
    saved = localStorage.getItem(THEME_KEY);
  } catch (_) {
    saved = null;
  }

  applyTheme(saved || getSystemPref());

  // keep in sync with system changes (only if user hasn't chosen)
  if (!saved && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    mq.addEventListener?.('change', (e) =>
      applyTheme(e.matches ? 'light' : 'dark')
    );
  }

  themeBtn?.addEventListener('click', () => {
    const isLight = document.documentElement.classList.toggle('light');
    const theme = isLight ? 'light' : 'dark';
    themeBtn.setAttribute('aria-pressed', String(isLight));
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (_) {
      /* ignore */
    }
  });

  /* =========================
     SMOOTH SCROLL (anchors)
     - respects reduced motion
  ========================= */
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute('href');
    if (!href || href === '#') return;

    const id = href.slice(1);
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
      const isNetlify = !!(
        contactForm.getAttribute('data-netlify') || contactForm.action
      );
      if (isNetlify) return; // let Netlify handle it

      // GH Pages or local: intercept
      e.preventDefault();
      const submitBtn = $(
        'button[type="submit"], input[type="submit"]',
        contactForm
      );
      submitBtn?.setAttribute('disabled', 'true');

      // Basic required check (optional: add more constraints)
      const invalid = $$('[required]', contactForm).find(
        (el) => !el.value?.trim()
      );
      if (invalid) {
        alert('Please fill in all required fields.');
        submitBtn?.removeAttribute('disabled');
        invalid.focus();
        return;
      }

      // Simulated success (GH Pages)
      try {
        await new Promise((r) => setTimeout(r, 250));
        alert('Thanks! Your message has been submitted.');
        contactForm.reset();
      } finally {
        submitBtn?.removeAttribute('disabled');
      }
    });
  }
})();