/* Responsive 3D interaction layer — no dependency beyond the existing page. */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (reduceMotion || touch) return;

  const selectors = [
    '.project-card', '.quest-card', '.battle-card',
    '.credential-card', '.contact-card', '.hero-image-wrapper'
  ];

  function attachTilt(el) {
    if (el.dataset.tiltReady) return;
    el.dataset.tiltReady = '1';

    let raf = 0;
    let px = 0.5;
    let py = 0.5;

    const render = () => {
      raf = 0;
      const rx = (0.5 - py) * 5;
      const ry = (px - 0.5) * 7;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
    };

    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      px = (event.clientX - rect.left) / rect.width;
      py = (event.clientY - rect.top) / rect.height;
      if (!raf) raf = requestAnimationFrame(render);
    }, { passive: true });

    el.addEventListener('pointerleave', () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      el.style.transform = '';
    });
  }

  function init() {
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach(attachTilt);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
