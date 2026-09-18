/**
 * Magnetic CTA Interaction with Spring Damping (Desktop only)
 */
import { state } from '../core/state.js';

export function initMagneticButtons() {
  if (state.isTouch || state.reducedMotion) return;

  const buttons = document.querySelectorAll('.btn, .logo, .cert-card, .reach-card');

  buttons.forEach(btn => {
    let boundRect = null;
    let isHovered = false;

    const onMouseEnter = () => {
      boundRect = btn.getBoundingClientRect();
      isHovered = true;
    };

    const onMouseMove = e => {
      if (!isHovered || !boundRect) return;
      const mouseX = e.clientX - boundRect.left;
      const mouseY = e.clientY - boundRect.top;
      const centerX = boundRect.width / 2;
      const centerY = boundRect.height / 2;

      const deltaX = (mouseX - centerX) * 0.28;
      const deltaY = (mouseY - centerY) * 0.28;

      btn.style.transform = `translate(${deltaX.toFixed(2)}px, ${deltaY.toFixed(2)}px)`;
    };

    const onMouseLeave = () => {
      isHovered = false;
      btn.style.transform = '';
      btn.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => {
        btn.style.transition = '';
      }, 400);
    };

    btn.addEventListener('mouseenter', onMouseEnter);
    btn.addEventListener('mousemove', onMouseMove);
    btn.addEventListener('mouseleave', onMouseLeave);
  });
}
