/**
 * DOM Reveal Animations and Timeline Progression Observer
 */
import { countUp } from './counters.js';

export function initReveal() {
  const io = new IntersectionObserver(
    entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
          e.target.querySelectorAll('[data-count]').forEach(countUp);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
  );

  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  const timelineNodes = [...document.querySelectorAll('.stop')];
  function trackTimelineFocus() {
    const mid = innerHeight * 0.65;
    timelineNodes.forEach(el => {
      const r = el.getBoundingClientRect();
      el.classList.toggle('hit', r.top < mid);
    });
  }

  return { trackTimelineFocus };
}
