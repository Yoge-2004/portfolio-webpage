/**
 * Procedural Web Audio Soundscape & Interactive Acoustic Feedback
 * Generates an ethereal generative ambient pad and tactile micro-chirps
 * with zero external audio assets.
 */

class SoundscapeController {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.filter = null;
    this.oscillators = [];
    this.isPlaying = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Warm Ambient Lowpass Filter
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(380, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      // Ambient Pad Gain
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.065, this.ctx.currentTime);
      this.ambientGain.connect(this.filter);
      this.filter.connect(this.masterGain);

      // Generative Chord Tones: Dm9 Harmonic Array (73.41Hz, 110Hz, 174.61Hz, 261.63Hz, 329.63Hz)
      const frequencies = [73.41, 110.0, 174.61, 261.63, 329.63];
      frequencies.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx.currentTime);

        // Individual voice gain
        const voiceGain = this.ctx.createGain();
        voiceGain.gain.setValueAtTime(0.18 / frequencies.length, this.ctx.currentTime);
        osc.connect(voiceGain);
        voiceGain.connect(this.ambientGain);

        osc.start();
        this.oscillators.push(osc);
      });

      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio not supported or failed to initialize:', e);
    }
  }

  toggle() {
    if (!this.initialized) {
      this.init();
    }
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = !this.isPlaying;
    const now = this.ctx.currentTime;

    if (this.isPlaying) {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(1.0, now + 1.2);
      this.playChirp(880, 0.12);
    } else {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
    }

    return this.isPlaying;
  }

  playChirp(freq = 620, duration = 0.08) {
    if (!this.initialized || !this.isPlaying || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.35, now + duration);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.02);
    } catch (_) {}
  }
}

export const soundscape = new SoundscapeController();

export function setupAudioUI() {
  const toggleBtn = document.getElementById('soundToggle');
  if (!toggleBtn) return;

  const label = toggleBtn.querySelector('.sound-label');

  toggleBtn.addEventListener('click', () => {
    const active = soundscape.toggle();
    if (active) {
      toggleBtn.classList.add('active');
      if (label) label.textContent = 'SOUND [ON]';
    } else {
      toggleBtn.classList.remove('active');
      if (label) label.textContent = 'SOUND [OFF]';
    }
  });

  // Micro feedback on interactive navigation and buttons
  document.querySelectorAll('a, button:not(#soundToggle), .pip, .chip, .sim-tab').forEach(el => {
    el.addEventListener('mouseenter', () => {
      soundscape.playChirp(520, 0.04);
    }, { passive: true });
    el.addEventListener('click', () => {
      soundscape.playChirp(740, 0.06);
    }, { passive: true });
  });
}
