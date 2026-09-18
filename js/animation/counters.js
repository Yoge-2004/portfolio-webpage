/**
 * Numerical Stats Count-Up Animation
 */
import { state } from '../core/state.js';

export function countUp(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const decimals = (el.dataset.count.split('.')[1] || '').length;

  if (state.reducedMotion) {
    el.textContent = target.toFixed(decimals) + suffix;
    return;
  }

  const duration = 1200;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = (target * ease).toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
