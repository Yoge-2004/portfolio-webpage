/**
 * Scroll Management: Lenis & GSAP ScrollTrigger Synchronization
 */
import { gsap } from '../../vendor/gsap/index.js';
import { ScrollTrigger } from '../../vendor/gsap/ScrollTrigger.js';
import Lenis from '../../vendor/lenis/lenis.mjs';
import { state, updateProgress } from '../core/state.js';

gsap.registerPlugin(ScrollTrigger);

export function initScroll() {
  ScrollTrigger.config({ ignoreMobileResize: true });

  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const lenis = (state.reducedMotion || isTouchDevice)
    ? null
    : new Lenis({
        duration: 1.15,
        smoothWheel: true,
        syncTouch: false
      });

  if (lenis) {
    lenis.on('scroll', e => {
      ScrollTrigger.update();
      if (typeof e?.progress === 'number') {
        updateProgress(e.progress);
      }
    });
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    window.__lenis = lenis;
  }

  window.addEventListener('scroll', () => {
    ScrollTrigger.update();
  }, { passive: true });

  ScrollTrigger.create({
    trigger: document.body,
    start: 'top top',
    end: 'bottom bottom',
    scrub: true,
    onUpdate: self => {
      updateProgress(self.progress);
    }
  });

  return lenis;
}
