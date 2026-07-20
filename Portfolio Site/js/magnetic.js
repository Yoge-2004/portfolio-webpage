/* ============================================
   MAGNETIC BUTTONS
   Buttons pull gently toward the cursor within a small
   radius, then spring back on leave. Desktop/fine-pointer
   only. Takes over the existing CSS :hover lift+scale by
   replicating it in the same JS-driven transform (inline
   style naturally wins over the CSS rule the instant it's
   set, so there's no flicker/fight — this is an intentional
   enhancement of that hover state, not a second system
   competing with it).
   ============================================ */
(function () {
    'use strict';

    function initMagnetic() {
        if (typeof gsap === 'undefined') return;
        if (window.matchMedia('(pointer: coarse)').matches) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        const buttons = document.querySelectorAll('.btn');
        if (!buttons.length) return;

        const PULL = 0.35;     // how much of the cursor offset the button follows
        const MAX_PULL = 14;   // px cap so it never drifts too far
        const LIFT = -4;       // matches the existing hover lift baseline

        buttons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const relX = e.clientX - (rect.left + rect.width / 2);
                const relY = e.clientY - (rect.top + rect.height / 2);
                gsap.to(btn, {
                    x: Math.max(-MAX_PULL, Math.min(MAX_PULL, relX * PULL)),
                    y: Math.max(-MAX_PULL, Math.min(MAX_PULL, relY * PULL)) + LIFT,
                    scale: 1.06,
                    duration: 0.4,
                    ease: 'power3.out',
                    overwrite: 'auto'
                });
            }, { passive: true });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { x: 0, y: 0, scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
            }, { passive: true });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMagnetic);
    } else {
        initMagnetic();
    }
})();
