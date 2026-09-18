/**
 * WebGL Context Loss and Reduced-Motion Fallback Controller
 */
import { state } from '../core/state.js';

export function setupFallback(canvas, renderer) {
  function fallbackToStatic(reason) {
    state.webglAvailable = false;
    try {
      if (renderer) renderer.setAnimationLoop(null);
    } catch (_) {}

    if (canvas) canvas.style.display = 'none';
    document.querySelectorAll('.rv').forEach(el => el.classList.add('in'));
    document.querySelectorAll('.stop,.row').forEach(el => el.classList.add('hit'));
    console.warn('3D World switched to static DOM mode:', reason);
  }

  if (canvas) {
    canvas.addEventListener(
      'webglcontextlost',
      e => {
        e.preventDefault();
        fallbackToStatic('WebGL context lost');
      },
      false
    );
  }

  return { fallbackToStatic };
}
