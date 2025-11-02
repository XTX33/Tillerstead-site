
// mobile nav
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
if (toggle && nav){
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// theme toggle
const themeBtn = document.querySelector('.theme-toggle');
if (themeBtn){
  themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('light');
    themeBtn.setAttribute('aria-pressed', String(isDark));
  });
}

// simple form success (for static hosts like Netlify; GitHub Pages will just POST nowhere)
if (document.forms.contact){
  document.forms.contact.addEventListener('submit', (e) => {
    // allow normal POST for Netlify; for GitHub Pages, show fake success
    if (location.hostname.endsWith('github.io') || location.hostname === 'localhost'){
      e.preventDefault();
      alert('Thanks! Your message has been submitted.');
      e.target.reset();
    }
  });
}
