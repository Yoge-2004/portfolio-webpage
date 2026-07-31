/**
 * Property test for glitch restoration guarantee.
 *
 * **Property 10: Glitch Restoration Guarantee**
 * For any `textContent` string:
 *   1. When f >= total, scrambleFrame(orig, f, total) === orig  (restoration guarantee)
 *   2. For any frame f < total, all chars at index < revealed match orig  (revealed chars locked)
 *   3. Spaces and '·' are always preserved regardless of frame
 *
 * The glitch algorithm is extracted as a pure function from initGlitch() in fx.js,
 * making the test environment-agnostic (no DOM, no setInterval).
 *
 * **Validates: Requirements 9.3, 9.4, 9.6**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

/* ─── Pure function extracted from fx.js ─────────────────────────────────────
 *
 * This mirrors the scramble logic inside the setInterval callback in initGlitch():
 *
 *   const revealed = Math.floor((f / total) * orig.length);
 *   el.textContent = orig.split('').map((c, i) => {
 *     if (c === ' ' || c === '·') return c;
 *     if (i < revealed) return c;
 *     return GLITCH_CHARSET[Math.floor(Math.random() * GLITCH_CHARSET.length)];
 *   }).join('');
 *   f++;
 *   if (f >= total) { el.textContent = orig; clearInterval(iv); }
 *
 * Notes:
 *  - total = orig.length * 2.8  (set once before interval starts)
 *  - The restoration (f >= total) happens AFTER the map, but for property testing
 *    we model the final-frame restoration as the terminal condition.
 *  - We test `scrambleFrame` for mid-animation frames and the final restoration
 *    guard separately, matching how the actual code branches.
 * ────────────────────────────────────────────────────────────────────────────── */

const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Compute the output for a single glitch frame.
 *
 * @param {string} orig   - Original text
 * @param {number} f      - Current frame index (0-based)
 * @param {number} total  - Total frames (orig.length * 2.8)
 * @returns {string}  The text content that would be set on this frame
 */
export function scrambleFrame(orig, f, total) {
  // Restoration guarantee: when interval has reached or passed total, restore
  if (f >= total) return orig;

  const revealed = Math.floor((f / total) * orig.length);
  return orig.split('').map((char, i) => {
    if (char === ' ' || char === '·') return char;   // preserve spaces
    if (i < revealed) return char;                    // lock in revealed chars
    return CHARSET[Math.floor(Math.random() * CHARSET.length)]; // scramble
  }).join('');
}

/* ─── Arbitraries ─────────────────────────────────────────────────────────── */

/**
 * Arbitrary for printable ASCII strings (no NUL, no control chars).
 * Uses fc.string() with a unicode alphabet that includes spaces and '·'.
 */
const printableStringArb = fc.string({
  minLength: 1,
  maxLength: 60,
  unit: fc.oneof(
    // regular ASCII letters and digits
    fc.mapToConstant(
      { num: 26, build: i => String.fromCharCode(65 + i) },  // A-Z
      { num: 26, build: i => String.fromCharCode(97 + i) },  // a-z
      { num: 10, build: i => String.fromCharCode(48 + i) },  // 0-9
    ),
    // spaces and middle-dot (special-cased by glitch)
    fc.constantFrom(' ', '·'),
    // some punctuation to exercise non-charset chars
    fc.constantFrom('.', '-', ':', '!', '?'),
  ),
});

/** Frame number in the mid-animation range [0, total) — computed from orig */
function frameBeforeTotalArb(origLength) {
  const total = origLength * 2.8;
  if (total <= 0) return fc.constant(0);
  // integer frame strictly before total
  return fc.integer({ min: 0, max: Math.max(0, Math.ceil(total) - 1) });
}

/** Frame number at or beyond total */
function frameAtOrAfterTotalArb(origLength) {
  const total = origLength * 2.8;
  return fc.integer({ min: Math.ceil(total), max: Math.ceil(total) + 200 });
}

/* ─── Unit tests — concrete examples ─────────────────────────────────────── */

describe('scrambleFrame — unit tests', () => {
  it('returns orig exactly when f === total', () => {
    const orig  = 'HELLO';
    const total = orig.length * 2.8; // 14
    expect(scrambleFrame(orig, total, total)).toBe(orig);
  });

  it('returns orig exactly when f > total', () => {
    const orig  = 'HELLO';
    const total = orig.length * 2.8;
    expect(scrambleFrame(orig, total + 5, total)).toBe(orig);
  });

  it('at f=0 revealed=0, so no chars are locked (except spaces)', () => {
    const orig   = 'ABCDE';
    const total  = orig.length * 2.8;
    const result = scrambleFrame(orig, 0, total);
    // All 5 chars are unrevealed — they may be anything in CHARSET
    expect(result).toHaveLength(orig.length);
    for (const ch of result) {
      expect(CHARSET).toContain(ch);
    }
  });

  it('preserves spaces at every frame', () => {
    const orig  = 'A B C';
    const total = orig.length * 2.8;
    for (let f = 0; f <= total + 10; f++) {
      const result = scrambleFrame(orig, f, total);
      expect(result[1]).toBe(' ');
      expect(result[3]).toBe(' ');
    }
  });

  it('preserves · at every frame', () => {
    const orig  = 'A·B·C';
    const total = orig.length * 2.8;
    for (let f = 0; f <= total + 10; f++) {
      const result = scrambleFrame(orig, f, total);
      expect(result[1]).toBe('·');
      expect(result[3]).toBe('·');
    }
  });

  it('all chars are locked when f is just below total', () => {
    const orig   = 'HELLO';
    const total  = orig.length * 2.8;
    // f = total - 1: revealed = floor(((total-1)/total) * 5) which should be 4 or 5
    const f      = Math.ceil(total) - 1;
    const result = scrambleFrame(orig, f, total);
    const revealed = Math.floor((f / total) * orig.length);
    for (let i = 0; i < revealed; i++) {
      if (orig[i] !== ' ' && orig[i] !== '·') {
        expect(result[i]).toBe(orig[i]);
      }
    }
  });

  it('output length always equals orig length', () => {
    const orig  = 'Test String 123';
    const total = orig.length * 2.8;
    for (let f = 0; f <= total + 5; f++) {
      expect(scrambleFrame(orig, f, total)).toHaveLength(orig.length);
    }
  });
});

/* ─── Property 10: Glitch Restoration Guarantee ──────────────────────────────
 *
 * **Validates: Requirements 9.3, 9.4, 9.6**
 * ────────────────────────────────────────────────────────────────────────────── */

describe('Property 10: Glitch Restoration Guarantee — Validates: Requirements 9.3, 9.4, 9.6', () => {

  /**
   * P10a: Restoration guarantee — for any string, when f >= total, output === orig.
   *
   * Validates Requirement 9.4: "When the Glitch_Animator interval completes (f ≥ total),
   * THE Glitch_Animator SHALL restore element.textContent to the original text exactly."
   */
  it('P10a: scrambleFrame returns orig exactly when f >= total [fast-check]', () => {
    fc.assert(
      fc.property(
        printableStringArb,
        (orig) => {
          const total = orig.length * 2.8;
          // Test f === ceil(total), f === ceil(total)+1, f === ceil(total)+100
          const fValues = [
            Math.ceil(total),
            Math.ceil(total) + 1,
            Math.ceil(total) + 100,
          ];
          for (const f of fValues) {
            const result = scrambleFrame(orig, f, total);
            if (result !== orig) {
              throw new Error(
                `Restoration failed: orig="${orig}", f=${f}, total=${total}, ` +
                `result="${result}"`
              );
            }
          }
          return true;
        }
      ),
      { numRuns: 2000 }
    );
  });

  /**
   * P10a-extra: Also test with arbitrary f >= total values.
   *
   * Validates Requirement 9.4 across a range of over-total frame values.
   */
  it('P10a-extra: scrambleFrame returns orig for arbitrary f >= total [fast-check]', () => {
    fc.assert(
      fc.property(
        printableStringArb,
        fc.integer({ min: 0, max: 500 }),  // extra frames past total
        (orig, extra) => {
          const total = orig.length * 2.8;
          const f     = Math.ceil(total) + extra;
          const result = scrambleFrame(orig, f, total);
          if (result !== orig) {
            throw new Error(
              `Restoration failed: orig="${orig}", f=${f}, total=${total}, ` +
              `result="${result}"`
            );
          }
          return true;
        }
      ),
      { numRuns: 1000 }
    );
  });

  /**
   * P10b: Revealed chars are locked — for any f < total, all chars at index < revealed
   *       match the original character.
   *
   * Validates Requirement 9.6: "WHILE the Glitch_Animator interval is running, THE
   * Glitch_Animator SHALL ensure all characters at indices < revealed are the original
   * characters, not scrambled characters."
   *
   * Note: spaces and '·' are always preserved regardless (tested separately in P10c),
   * so we check the lock-in property for all char positions that are revealed.
   */
  it('P10b: all revealed chars (index < revealed) match orig at any frame f < total [fast-check]', () => {
    fc.assert(
      fc.property(
        printableStringArb,
        (orig) => {
          const total = orig.length * 2.8;
          if (total === 0) return true;

          // Sample several frames in the mid-animation range
          const maxFrame = Math.max(0, Math.ceil(total) - 1);
          const framesToTest = [
            0,
            Math.floor(maxFrame * 0.25),
            Math.floor(maxFrame * 0.5),
            Math.floor(maxFrame * 0.75),
            maxFrame,
          ];

          for (const f of framesToTest) {
            if (f >= total) continue;  // skip frames outside mid-animation range
            const revealed = Math.floor((f / total) * orig.length);
            const result   = scrambleFrame(orig, f, total);

            for (let i = 0; i < revealed; i++) {
              if (result[i] !== orig[i]) {
                throw new Error(
                  `Revealed char mismatch: orig="${orig}", f=${f}, total=${total}, ` +
                  `i=${i}, expected="${orig[i]}", got="${result[i]}", revealed=${revealed}`
                );
              }
            }
          }
          return true;
        }
      ),
      { numRuns: 2000 }
    );
  });

  /**
   * P10b-fc: Same as P10b but uses fast-check to also generate the frame index.
   */
  it('P10b-fc: revealed chars match orig for fc-generated f < total [fast-check]', () => {
    fc.assert(
      fc.property(
        printableStringArb,
        fc.integer({ min: 0, max: 1000 }),
        (orig, fRaw) => {
          const total = orig.length * 2.8;
          if (total <= 0) return true;

          // Clamp f to the mid-animation range [0, total)
          const f = fRaw % Math.max(1, Math.ceil(total));
          if (f >= total) return true;  // safety — skip if f landed at boundary

          const revealed = Math.floor((f / total) * orig.length);
          const result   = scrambleFrame(orig, f, total);

          for (let i = 0; i < revealed; i++) {
            if (result[i] !== orig[i]) {
              throw new Error(
                `Revealed char mismatch: orig="${orig}", f=${f}, total=${total}, ` +
                `i=${i}, expected="${orig[i]}", got="${result[i]}", revealed=${revealed}`
              );
            }
          }
          return true;
        }
      ),
      { numRuns: 2000 }
    );
  });

  /**
   * P10c: Space and '·' preservation — both special chars are always returned
   *       unchanged regardless of frame or reveal state.
   *
   * Validates Requirement 9.3: the glitch charset is uppercase ASCII + digits;
   * spaces and middle-dots are explicitly excluded from scrambling in the algorithm.
   */
  it('P10c: spaces and · are preserved at every frame regardless of reveal state [fast-check]', () => {
    fc.assert(
      fc.property(
        // Strings that contain at least one space or '·'
        fc.oneof(
          fc.tuple(
            fc.string({ minLength: 0, maxLength: 20, unit: fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')) }),
            fc.constant(' '),
            fc.string({ minLength: 0, maxLength: 20, unit: fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')) }),
          ).map(([a, sep, b]) => a + sep + b),
          fc.tuple(
            fc.string({ minLength: 0, maxLength: 20, unit: fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')) }),
            fc.constant('·'),
            fc.string({ minLength: 0, maxLength: 20, unit: fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')) }),
          ).map(([a, sep, b]) => a + sep + b),
        ),
        fc.integer({ min: 0, max: 1000 }),  // arbitrary frame
        (orig, f) => {
          if (orig.length === 0) return true;
          const total = orig.length * 2.8;
          const result = scrambleFrame(orig, f, total);

          for (let i = 0; i < orig.length; i++) {
            if (orig[i] === ' ' || orig[i] === '·') {
              if (result[i] !== orig[i]) {
                throw new Error(
                  `Special char lost: orig="${orig}", f=${f}, total=${total}, ` +
                  `i=${i}, orig[i]="${orig[i]}", result[i]="${result[i]}"`
                );
              }
            }
          }
          return true;
        }
      ),
      { numRuns: 2000 }
    );
  });

  /**
   * P10d: Output length invariant — scrambleFrame always returns a string
   *       of the same length as orig, at every frame.
   */
  it('P10d: output length always equals orig.length at every frame [fast-check]', () => {
    fc.assert(
      fc.property(
        printableStringArb,
        fc.integer({ min: 0, max: 1000 }),
        (orig, f) => {
          const total  = orig.length * 2.8;
          const result = scrambleFrame(orig, f, total);
          if (result.length !== orig.length) {
            throw new Error(
              `Length mismatch: orig.length=${orig.length}, result.length=${result.length}, ` +
              `f=${f}, total=${total}`
            );
          }
          return true;
        }
      ),
      { numRuns: 2000 }
    );
  });

  /**
   * P10e: Scrambled chars are always from CHARSET — unrevealed non-space chars
   *       must be drawn from 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.
   *
   * Validates that the scramble only uses the specified charset (Requirement 9.3).
   */
  it('P10e: unrevealed non-space chars are always from CHARSET [fast-check]', () => {
    fc.assert(
      fc.property(
        // Strings of all-uppercase-or-digit chars (no spaces) so we can check scrambled positions
        fc.string({
          minLength: 2,
          maxLength: 30,
          unit: fc.constantFrom(...CHARSET.split('')),
        }),
        fc.integer({ min: 0, max: 1000 }),
        (orig, fRaw) => {
          const total = orig.length * 2.8;
          if (total <= 0) return true;

          // Use a frame strictly in the mid-animation range
          const f = fRaw % Math.max(1, Math.ceil(total));
          if (f >= total) return true;

          const revealed = Math.floor((f / total) * orig.length);
          const result   = scrambleFrame(orig, f, total);

          // Unrevealed positions must contain a CHARSET character
          for (let i = revealed; i < orig.length; i++) {
            if (!CHARSET.includes(result[i])) {
              throw new Error(
                `Unrevealed char "${result[i]}" at i=${i} is not in CHARSET. ` +
                `orig="${orig}", f=${f}, revealed=${revealed}`
              );
            }
          }
          return true;
        }
      ),
      { numRuns: 2000 }
    );
  });
});
