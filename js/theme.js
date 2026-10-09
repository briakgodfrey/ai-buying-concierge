// Theme switch. The page starts in the visitor's system theme (set by the
// inline script in <head>, so there's no flash). Choosing one here saves it.

const root = document.documentElement;
const toggle = document.querySelector('.theme-toggle');

function setTheme(theme) {
  root.dataset.theme = theme;
  // The label stays "Dark mode"; aria-pressed says whether it's on.
  if (toggle) toggle.setAttribute('aria-pressed', String(theme === 'dark'));
}

setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');

if (toggle) {
  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked: still works for this visit */ }
  });
}
