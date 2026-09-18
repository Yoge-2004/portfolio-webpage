/**
 * Loading Screen Controller
 */
import { state } from '../core/state.js';

export function initLoading(onReady) {
  const loadEl = document.getElementById('load');
  const loadFill = document.getElementById('loadFill');
  const loadPct = document.getElementById('loadPct');

  let simulated = 0;
  const timer = setInterval(() => {
    simulated = Math.min(92, simulated + 18);
    if (loadFill) loadFill.style.width = simulated + '%';
    if (loadPct) loadPct.textContent = String(simulated).padStart(2, '0') + '%';
  }, 90);

  const fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();
  const timeoutFallback = new Promise(r => setTimeout(r, 1400));

  Promise.race([fontsReady, timeoutFallback]).then(() => {
    clearInterval(timer);
    if (loadFill) loadFill.style.width = '100%';
    if (loadPct) loadPct.textContent = '100%';

    setTimeout(() => {
      if (loadEl) loadEl.classList.add('off');
      state.worldReady = true;

      // Trigger reveals
      document.querySelectorAll('.rv').forEach((el, i) => {
        setTimeout(() => el.classList.add('in'), state.reducedMotion ? 0 : i * 65);
      });

      if (onReady) onReady();
    }, 220);
  });
}
