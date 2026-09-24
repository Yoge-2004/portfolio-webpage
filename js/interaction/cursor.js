/**
 * Precision Architectural Reticle Cursor Controller (Desktop only)
 */
import { state } from '../core/state.js';

export function initCursor() {
  if (state.isTouch) return;

  const reticle = document.getElementById('reticle');
  if (!reticle) return;

  let mx = innerWidth / 2;
  let my = innerHeight / 2;
  let rx = mx;
  let ry = my;

  addEventListener('pointermove', e => {
    mx = e.clientX;
    my = e.clientY;
    state.pointer.rawX = mx;
    state.pointer.rawY = my;
  }, { passive: true });

  function update() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    reticle.style.left = rx.toFixed(1) + 'px';
    reticle.style.top = ry.toFixed(1) + 'px';
    requestAnimationFrame(update);
  }
  requestAnimationFrame(update);

  // Hover expansion over interactive targets
  const hoverTargets = document.querySelectorAll('a, button, input, .panel, .vault, .cert-card, .reach-card, .slot');
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => reticle.classList.add('hot'));
    el.addEventListener('mouseleave', () => reticle.classList.remove('hot'));
  });
}
