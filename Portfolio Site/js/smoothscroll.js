/* ============================================
   SMOOTH SCROLL (Lenis)
   Replaces native instant-jump wheel scroll with
   physics-based momentum easing — this is the single
   biggest lever for a "cinematic" scroll feel, and
   every scroll-tied effect already on this site
   (parallax, kinetic type ripple, the 3D dolly) reads
   real scroll position, so they all benefit for free
   once this is driving the actual scroll.

   Desktop / fine-pointer only: touchscreens already have
   good native momentum scrolling, and stacking Lenis on
   top there mostly just costs battery for little gain.
   Fully skipped under prefers-reduced-motion.

   Exposes window.__lenis so story.js's nav-click handlers
   can route through lenis.scrollTo() instead of the native
   scrollIntoView()/window.scrollTo(), which don't coordinate
   with Lenis's interception of the scroll otherwise.
   ============================================ */
(function () {
    'use strict';

    function initSmoothScroll() {
        if (typeof Lenis === 'undefined') return;
        if (window.matchMedia('(pointer: coarse)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const lenis = new Lenis({
            duration: 1.15,
            easing: (t) => 1 - Math.pow(1 - t, 3),
            smoothWheel: true,
        });

        window.__lenis = lenis;

        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => { lenis.raf(time * 1000); });
            gsap.ticker.lagSmoothing(0);
        } else {
            // No GSAP available for some reason — still drive Lenis's own loop.
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSmoothScroll);
    } else {
        initSmoothScroll();
    }
})();
