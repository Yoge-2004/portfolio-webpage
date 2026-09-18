/**
 * Primary Navigation and Smooth Scrolling Controller
 */
import { state } from '../core/state.js';

export function initNavigation(lenisInstance) {
  const navLinks = document.querySelectorAll('.nav a, .sheet a, .logo');

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetEl = document.querySelector(href);
        if (targetEl) {
          e.preventDefault();
          if (lenisInstance && !state.reducedMotion) {
            lenisInstance.scrollTo(targetEl, { offset: -76, duration: 1.2 });
          } else {
            targetEl.scrollIntoView({ behavior: state.reducedMotion ? 'auto' : 'smooth' });
          }
        }
      }
    });
  });
}
