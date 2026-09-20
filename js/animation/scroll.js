/**
 * Scroll Management: Lenis & GSAP ScrollTrigger Synchronization
 */
import { gsap } from '../../vendor/gsap/index.js';
import { ScrollTrigger } from '../../vendor/gsap/ScrollTrigger.js';
import Lenis from '../../vendor/lenis/lenis.mjs';
import { state, updateProgress } from '../core/state.js';

gsap.registerPlugin(ScrollTrigger);

export function initScroll() {
  // Known GreenSock fix for ScrollTrigger recalculating spuriously when the
  // mobile address bar shows/hides mid-scroll. Safe to combine with Lenis —
  // it's a config flag, not a scroll-hijacking system. (Deliberately NOT
  // using ScrollTrigger.normalizeScroll() here: verified via a real
  // production Lenis+ScrollTrigger+R3F example that it's designed to
  // replace a smooth-scroll library, not run alongside one — stacking it
  // on top of Lenis risks two systems fighting over the same scroll input.)
  ScrollTrigger.config({ ignoreMobileResize: true });

  const lenis = state.reducedMotion
    ? null
    : new Lenis({
        duration: 1.15,
        smoothWheel: true,
        syncTouch: true
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
