/**
 * Centralized Application State
 */

export const state = {
  // Device & Capabilities
  reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
  isTouch: matchMedia('(pointer: coarse)').matches,
  isMobile: innerWidth < 768 || matchMedia('(pointer: coarse)').matches,
  webglAvailable: true,
  worldReady: false,

  // Scroll Progression
  scrollProgress: 0,
  targetProgress: 0,

  // Narrative Chapter State
  activeChapter: 'PROLOGUE',
  activeChapterIndex: 'CH. 01',
  depthMeters: '000.0',

  // Pointer Telemetry
  pointer: {
    rawX: innerWidth / 2,
    rawY: innerHeight / 2,
    normX: 0,
    normY: 0,
    smoothX: 0,
    smoothY: 0
  }
};

const listeners = new Set();

export function subscribeState(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function notifyStateChange(property, value) {
  listeners.forEach(cb => {
    try {
      cb(property, value, state);
    } catch (err) {
      console.error('State subscriber error:', err);
    }
  });
}

export function updateActiveChapter(chapter, index) {
  if (state.activeChapter !== chapter || state.activeChapterIndex !== index) {
    state.activeChapter = chapter;
    state.activeChapterIndex = index;
    notifyStateChange('chapter', { chapter, index });
  }
}

export function updateProgress(target) {
  state.targetProgress = target;
  state.depthMeters = (target * 160).toFixed(1);
  notifyStateChange('progress', target);
}
