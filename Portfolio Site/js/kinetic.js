/* ============================================
   KINETIC TYPOGRAPHY
   Splits every [data-split] heading into per-character
   spans and drives a scroll-scrubbed ripple (y / skew /
   scaleY) across them as their section passes through
   the viewport. Runs on a DIFFERENT property set than
   the existing clip-path wipe reveal in story.js, and on
   separate child <span> elements it creates itself, so
   there is no fight with that one-shot entrance animation.
   Must load BEFORE story.js so splitting happens before
   anything else measures/animates these headings.
   ============================================ */
(function () {
    'use strict';

    function splitChars(el) {
        const text = el.textContent;
        el.textContent = '';
        el.setAttribute('aria-label', text);
        const chars = [];
        for (const ch of text) {
            if (ch === ' ') {
                el.appendChild(document.createTextNode(' '));
                continue;
            }
            const span = document.createElement('span');
            span.textContent = ch;
            span.className = 'kchar';
            span.style.display = 'inline-block';
            span.setAttribute('aria-hidden', 'true');
            el.appendChild(span);
            chars.push(span);
        }
        return chars;
    }

    function initKinetic() {
        const heads = Array.from(document.querySelectorAll('[data-split]'));
        if (!heads.length) return;

        // Split immediately regardless of GSAP availability, so the
        // markup is stable before story.js's clip-path reveal measures it.
        const rigs = heads.map(el => ({ el, chars: splitChars(el) }));

        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        gsap.registerPlugin(ScrollTrigger);
        const isMobile = window.innerWidth < 640;
        const amp = isMobile ? 5 : 10;      // px vertical ripple
        const skewAmp = isMobile ? 3 : 7;   // deg shear
        const scaleAmp = 0.06;

        rigs.forEach(({ el, chars }) => {
            if (!chars.length) return;
            const section = el.closest('.story-section') || el;
            ScrollTrigger.create({
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
                onUpdate(self) {
                    const p = self.progress;
                    const phase = p * Math.PI * 2;
                    chars.forEach((c, i) => {
                        const wave = Math.sin(phase + i * 0.45);
                        c.style.transform =
                            `translateY(${(wave * amp).toFixed(2)}px) skewX(${(wave * skewAmp).toFixed(2)}deg) scaleY(${(1 + wave * scaleAmp).toFixed(3)})`;
                    });
                }
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initKinetic);
    } else {
        initKinetic();
    }
})();
