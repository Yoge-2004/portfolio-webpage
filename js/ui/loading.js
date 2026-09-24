/**
 * Loading Screen Controller
 */
import { state } from '../core/state.js';

export function initLoading(onReady) {
  const loadEl = document.getElementById('load');
  const loadFill = document.getElementById('loadFill');
  const loadPct = document.getElementById('loadPct');

  const isAutomated = navigator.webdriver || window.location.search.includes('test=true');
  const stepInterval = isAutomated ? 15 : 45;
  const timeoutLimit = isAutomated ? 120 : 500;

  let simulated = 0;
  const timer = setInterval(() => {
    simulated = Math.min(96, simulated + (isAutomated ? 45 : 25));
    if (loadFill) loadFill.style.width = simulated + '%';
    if (loadPct) loadPct.textContent = String(simulated).padStart(2, '0') + '%';
  }, stepInterval);

  const fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();
  const timeoutFallback = new Promise(r => setTimeout(r, timeoutLimit));

  Promise.race([fontsReady, timeoutFallback]).then(() => {
    clearInterval(timer);
    if (loadFill) loadFill.style.width = '100%';
    if (loadPct) loadPct.textContent = '100%';

    setTimeout(() => {
      if (loadEl) loadEl.classList.add('off');
      state.worldReady = true;

      // Trigger reveals
      document.querySelectorAll('.rv').forEach((el, i) => {
        setTimeout(() => el.classList.add('in'), state.reducedMotion ? 0 : i * (isAutomated ? 0 : 50));
      });

      if (onReady) onReady();
    }, isAutomated ? 40 : 150);
  });
}
