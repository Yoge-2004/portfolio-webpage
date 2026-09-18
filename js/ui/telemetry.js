/**
 * Bottom HUD Telemetry & Chapter Tracker
 */
import { state, updateActiveChapter } from '../core/state.js';

export function initTelemetry() {
  const hudTitle = document.getElementById('hudTitle');
  const hudIndex = document.getElementById('hudIndex');
  const hudDepth = document.getElementById('hudDepth');
  const barFill = document.getElementById('barFill');

  const chapterSections = [...document.querySelectorAll('section[data-chapter], article[data-chapter]')];

  function checkActiveChapter() {
    const triggerY = innerHeight * 0.45;
    for (let i = chapterSections.length - 1; i >= 0; i--) {
      const sec = chapterSections[i];
      const rect = sec.getBoundingClientRect();
      if (rect.top <= triggerY && rect.bottom >= triggerY) {
        const title = sec.dataset.chapter || 'ARCHIVE';
        const idx = sec.dataset.idx || 'CH. 01';

        if (state.activeChapter !== title) {
          updateActiveChapter(title, idx);
          if (hudTitle) hudTitle.textContent = title;
          if (hudIndex) hudIndex.textContent = idx;

          // Update primary navigation highlight
          const targetId = sec.id || sec.closest('[id]')?.id;
          document.querySelectorAll('.nav a').forEach(a => {
            a.classList.toggle('active', a.dataset.target === targetId);
          });
        }
        break;
      }
    }
  }

  function updateHUD() {
    if (barFill) {
      barFill.style.width = (state.scrollProgress * 100).toFixed(1) + '%';
    }
    if (hudDepth) {
      const meters = (state.scrollProgress * 160).toFixed(1);
      hudDepth.textContent = `DEPTH: -${meters.padStart(5, '0')}m`;
    }
  }

  return {
    checkActiveChapter,
    updateHUD
  };
}
