/**
 * Scroll Management: Lenis & GSAP ScrollTrigger Synchronization
 */
import { gsap } from '../../vendor/gsap/index.js';
import { ScrollTrigger } from '../../vendor/gsap/ScrollTrigger.js';
import Lenis from '../../vendor/lenis/lenis.mjs';
import { state, updateProgress } from '../core/state.js';

gsap.registerPlugin(ScrollTrigger);

export function initScroll() {
  const lenis = state.reducedMotion
    ? null
    : new Lenis({
        duration: 1.15,
        smoothWheel: true,
        syncTouch: true
      });

  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

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
