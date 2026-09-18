/**
 * Normalized Pointer Tracking for 3D Camera Parallax
 */
import { state } from '../core/state.js';

export function initPointer() {
  addEventListener('pointermove', e => {
    state.pointer.normX = (e.clientX / innerWidth - 0.5) * 2;
    state.pointer.normY = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  return {
    updateSmoothPointer(easing = 0.05) {
      state.pointer.smoothX += (state.pointer.normX - state.pointer.smoothX) * easing;
      state.pointer.smoothY += (state.pointer.normY - state.pointer.smoothY) * easing;
      return {
        x: state.pointer.smoothX,
        y: state.pointer.smoothY
      };
    }
  };
}
