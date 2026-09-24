/**
 * SCROLL
 * ------
 * Lenis smooth scrolling wired into GSAP ScrollTrigger, with a
 * reduced-motion path that skips smoothing entirely.
 */

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../utils.js";

gsap.registerPlugin(ScrollTrigger);

export function initScroll({ onProgress }) {
  if (prefersReducedMotion()) {
    // Native scrolling, no smoothing. ScrollTrigger still drives everything.
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      onProgress?.(max > 0 ? window.scrollY / max : 0);
      ScrollTrigger.update();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return { lenis: null, destroy: () => window.removeEventListener("scroll", onScroll) };
  }

  const lenis = new Lenis({
    duration: 1.05,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
    touchMultiplier: 1.4,
  });

  lenis.on("scroll", ScrollTrigger.update);

  const onScroll = ({ scroll, limit }) => {
    onProgress?.(limit > 0 ? scroll / limit : 0);
  };
  lenis.on("scroll", onScroll);

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return {
    lenis,
    destroy: () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    },
  };
}
