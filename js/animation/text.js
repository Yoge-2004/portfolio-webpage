/**
 * Kinetic Editorial Typography & Masked Word Reveals
 */
import { state } from '../core/state.js';

export function initTextReveals() {
  if (state.reducedMotion) return;

  const isAutomated = navigator.webdriver || window.location.search.includes('test=true');
  const displayTitles = document.querySelectorAll('.t-hero, .t-xl, .t-lg');

  displayTitles.forEach(title => {
    // Avoid double-splitting
    if (title.dataset.split) return;
    title.dataset.split = 'true';

    const text = title.innerHTML;
    // Process text nodes while preserving line breaks and tags
    const lines = text.split(/<br\s*\/?>/i);

    const newHtml = lines.map(line => {
      const words = line.trim().split(/\s+/);
      const wrappedWords = words.map(w => `<span class="word-mask"><span class="word-inner">${w}</span></span>`).join(' ');
      return `<span class="line-mask">${wrappedWords}</span>`;
    }).join('<br>');

    title.innerHTML = newHtml;
  });

  // Observe display titles for staggered word entrance
  const textObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const inners = entry.target.querySelectorAll('.word-inner');
        inners.forEach((w, idx) => {
          setTimeout(() => {
            w.classList.add('word-in');
          }, isAutomated ? 0 : idx * 35);
        });
        textObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -2% 0px' });

  displayTitles.forEach(title => textObserver.observe(title));
}
