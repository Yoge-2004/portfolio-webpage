/**
 * Property test for accent color convergence.
 *
 * **Property 4: Accent Color Convergence**
 * For all (start, target) pairs in [0,255]³, after 500 RAF frames,
 * |accentCurr[i] - accentTarget[i]| ≤ 0.3 for all channels.
 *
 * The lerp formula (factor L = 0.03, per-channel):
 *   Each frame: if |target - curr| > 0.3, then curr += (target - curr) * L
 *   Termination: when |delta| ≤ 0.3, the channel is considered converged.
 *
 * This test does NOT import any browser APIs. It extracts and exercises
 * the pure lerp logic as a standalone function.
 *
 * **Validates: Requirements 7.2, 7.3, 7.4**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/* ─── Pure lerp logic extracted from fx.js ────────────────────────────────
 *
 * This mirrors the accent lerp in initMasterRAF() exactly:
 *   const L = 0.03;
 *   const delta = target - curr;
 *   if (Math.abs(delta) > 0.3) { curr += delta * L; }
 *
 * It is a pure function with no side effects — safe to test without a browser.
 * ─────────────────────────────────────────────────────────────────────────── */

const LERP_FACTOR       = 0.03;
const CONVERGENCE_DELTA = 0.3;
const MAX_FRAMES        = 500;

/**
 * Simulate the accent color lerp for a single channel over N frames.
 *
 * @param {number} start   - Initial channel value (0–255)
 * @param {number} target  - Target channel value (0–255)
 * @param {number} frames  - Number of frames to simulate
 * @returns {number}  The channel value after `frames` iterations
 */
export function simulateLerp(start, target, frames) {
  let curr = start;
  for (let i = 0; i < frames; i++) {
    const delta = target - curr;
    if (Math.abs(delta) > CONVERGENCE_DELTA) {
      curr += delta * LERP_FACTOR;
    }
  }
  return curr;
}

/**
 * Simulate the accent lerp for all 3 channels simultaneously.
 *
 * @param {[number,number,number]} startRGB   - Initial [R,G,B]
 * @param {[number,number,number]} targetRGB  - Target  [R,G,B]
 * @param {number}                 frames     - Number of frames
 * @returns {[number,number,number]}  Final [R,G,B] after `frames` iterations
 */
export function simulateLerpRGB(startRGB, targetRGB, frames) {
  return [
    simulateLerp(startRGB[0], targetRGB[0], frames),
    simulateLerp(startRGB[1], targetRGB[1], frames),
    simulateLerp(startRGB[2], targetRGB[2], frames),
  ];
}

/* ─── Unit tests — concrete examples ─────────────────────────────────────── */

describe('simulateLerp — unit tests', () => {
  it('converges from 0 to 255 in fewer than 500 frames', () => {
    const result = simulateLerp(0, 255, MAX_FRAMES);
    expect(Math.abs(255 - result)).toBeLessThanOrEqual(CONVERGENCE_DELTA);
  });

  it('converges from 255 to 0 in fewer than 500 frames', () => {
    const result = simulateLerp(255, 0, MAX_FRAMES);
    expect(Math.abs(0 - result)).toBeLessThanOrEqual(CONVERGENCE_DELTA);
  });

  it('does not move when start === target', () => {
    const result = simulateLerp(128, 128, MAX_FRAMES);
    expect(result).toBe(128);
  });

  it('does not move when |delta| ≤ 0.3 from the first frame', () => {
    const start  = 100.1;
    const target = 100.0;
    const result = simulateLerp(start, target, MAX_FRAMES);
    // Delta = -0.1, which is already ≤ 0.3 in absolute value — should not move
    expect(result).toBe(start);
  });

  it('converges from 0 to 102 (prologue cyan red channel) in 500 frames', () => {
    const result = simulateLerp(0, 102, MAX_FRAMES);
    expect(Math.abs(102 - result)).toBeLessThanOrEqual(CONVERGENCE_DELTA);
  });

  it('converges from 102 to 16 (battles emerald red channel) in 500 frames', () => {
    const result = simulateLerp(102, 16, MAX_FRAMES);
    expect(Math.abs(16 - result)).toBeLessThanOrEqual(CONVERGENCE_DELTA);
  });

  it('converges a full cyan→amber transition in 500 frames', () => {
    // prologue [102,231,242] → credentials [244,199,107]
    const [r, g, b] = simulateLerpRGB([102, 231, 242], [244, 199, 107], MAX_FRAMES);
    expect(Math.abs(244 - r)).toBeLessThanOrEqual(CONVERGENCE_DELTA);
    expect(Math.abs(199 - g)).toBeLessThanOrEqual(CONVERGENCE_DELTA);
    expect(Math.abs(107 - b)).toBeLessThanOrEqual(CONVERGENCE_DELTA);
  });
});

/* ─── Property 4: Accent Color Convergence ─────────────────────────────────
 *
 * **Validates: Requirements 7.2, 7.3, 7.4**
 * ─────────────────────────────────────────────────────────────────────────── */

describe('Property 4: Accent Color Convergence — Validates: Requirements 7.2, 7.3, 7.4', () => {

  /**
   * P4a: For any single-channel (start, target) pair in [0,255],
   *      after 500 frames the result is within 0.3 of target.
   */
  it('P4a: single channel converges to within 0.3 of target after 500 frames [fast-check]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }),  // start
        fc.integer({ min: 0, max: 255 }),  // target
        (start, target) => {
          const result = simulateLerp(start, target, MAX_FRAMES);
          const dist   = Math.abs(target - result);
          if (dist > CONVERGENCE_DELTA) {
            throw new Error(
              `Channel did not converge: start=${start}, target=${target}, ` +
              `result=${result.toFixed(4)}, dist=${dist.toFixed(4)} > ${CONVERGENCE_DELTA}`
            );
          }
          return true;
        }
      ),
      { numRuns: 2000 }
    );
  });

  /**
   * P4b: For any full RGB (start, target) pair — both drawn from [0,255]³ —
   *      after 500 frames all three channels are within 0.3 of their targets.
   */
  it('P4b: all 3 RGB channels converge within 0.3 after 500 frames [fast-check]', () => {
    const channelArb = fc.integer({ min: 0, max: 255 });

    fc.assert(
      fc.property(
        fc.tuple(channelArb, channelArb, channelArb),  // startRGB
        fc.tuple(channelArb, channelArb, channelArb),  // targetRGB
        (startRGB, targetRGB) => {
          const result = simulateLerpRGB(startRGB, targetRGB, MAX_FRAMES);
          for (let i = 0; i < 3; i++) {
            const dist = Math.abs(targetRGB[i] - result[i]);
            if (dist > CONVERGENCE_DELTA) {
              const labels = ['R', 'G', 'B'];
              throw new Error(
                `Channel ${labels[i]} did not converge: ` +
                `start=${startRGB[i]}, target=${targetRGB[i]}, ` +
                `result=${result[i].toFixed(4)}, dist=${dist.toFixed(4)} > ${CONVERGENCE_DELTA}`
              );
            }
          }
          return true;
        }
      ),
      { numRuns: 1000 }
    );
  });

  /**
   * P4c: Convergence is monotonic — the distance to target never increases
   *      after the first frame of movement.
   *
   * This validates Requirement 7.3: interpolation terminates when |delta| ≤ 0.3,
   * and the lerp never overshoots (factor 0.03 < 1).
   */
  it('P4c: lerp never overshoots — distance to target is non-increasing [fast-check]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        (start, target) => {
          let curr     = start;
          let prevDist = Math.abs(target - curr);

          for (let f = 0; f < MAX_FRAMES; f++) {
            const delta = target - curr;
            if (Math.abs(delta) > CONVERGENCE_DELTA) {
              curr += delta * LERP_FACTOR;
            }
            const newDist = Math.abs(target - curr);

            // Once within convergence band, distance can only stay ≤ 0.3
            // Before that, it must be non-increasing (monotone convergence)
            if (newDist > prevDist + 1e-9) {
              throw new Error(
                `Overshoot detected at frame ${f}: start=${start}, target=${target}, ` +
                `prevDist=${prevDist.toFixed(6)}, newDist=${newDist.toFixed(6)}`
              );
            }
            prevDist = newDist;
          }
          return true;
        }
      ),
      { numRuns: 1000 }
    );
  });

  /**
   * P4d: Termination condition — a channel that is already within 0.3 of its
   *      target is never moved by the lerp (it stays put).
   *
   * The lerp guard is: if (Math.abs(delta) > 0.3) { ... }
   * So any |delta| ≤ 0.3 means the channel is frozen.
   *
   * We use offsets in [-0.29, 0.29] (strictly inside the termination band)
   * to avoid 32-bit float rounding near the 0.3 boundary.
   *
   * Validates Requirement 7.3: terminate when |delta| ≤ 0.3.
   */
  it('P4d: channels within 0.3 of target are not moved by the lerp [fast-check]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }),
        // Offset strictly inside the convergence band (< 0.3 away from target)
        fc.float({ min: Math.fround(-0.29), max: Math.fround(0.29), noNaN: true }),
        (target, offset) => {
          // Clamp to valid RGB range so the offset doesn't push us out of [0,255]
          const start  = Math.max(0, Math.min(255, target + offset));
          const result = simulateLerp(start, target, 1);  // one frame
          // The channel must not have moved — delta is within the termination band
          expect(result).toBe(start);
          return true;
        }
      ),
      { numRuns: 2000 }
    );
  });
});
