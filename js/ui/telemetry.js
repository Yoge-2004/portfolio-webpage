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
    let closestSec = null;
    let minDistance = Infinity;

    for (let i = 0; i < chapterSections.length; i++) {
      const sec = chapterSections[i];
      const rect = sec.getBoundingClientRect();
      if (rect.top <= triggerY && rect.bottom >= triggerY) {
        closestSec = sec;
        break;
      }
      const secCenter = (rect.top + rect.bottom) / 2;
      const dist = Math.abs(secCenter - triggerY);
      if (dist < minDistance) {
        minDistance = dist;
        closestSec = sec;
      }
    }

    if (closestSec) {
      const title = closestSec.dataset.chapter || 'ARCHIVE';
      const idx = closestSec.dataset.idx || 'CH. 01';

      if (state.activeChapter !== title) {
        updateActiveChapter(title, idx);
        if (hudTitle) hudTitle.textContent = title;
        if (hudIndex) hudIndex.textContent = idx;

        // Update primary navigation highlight
        const targetId = closestSec.id || closestSec.closest('[id]')?.id;
        document.querySelectorAll('.nav a').forEach(a => {
          a.classList.toggle('active', a.dataset.target === targetId);
        });

        // Update floating quick-dock highlight
        document.querySelectorAll('.dock-pip').forEach(pip => {
          pip.classList.toggle('active', pip.dataset.dock === targetId);
        });
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
