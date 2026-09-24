/**
 * Mobile Navigation Menu Drawer Controller
 */
export function initMobileMenu() {
  const burger = document.getElementById('burger');
  const sheet = document.getElementById('sheet');
  const label = document.getElementById('bLabel');
  let open = false;

  const toggle = v => {
    open = v;
    document.body.classList.toggle('menu-on', v);
    if (burger) burger.setAttribute('aria-expanded', String(v));
    if (sheet) sheet.setAttribute('aria-hidden', String(!v));
    if (label) label.textContent = v ? 'Close' : 'Menu';
    if (v) sheet?.querySelector('a')?.focus();
  };

  burger?.addEventListener('click', () => toggle(!open));
  sheet?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));

  addEventListener('keydown', e => {
    if (e.key === 'Escape' && open) {
      toggle(false);
      burger?.focus();
    }
  });

  return { toggle };
}
