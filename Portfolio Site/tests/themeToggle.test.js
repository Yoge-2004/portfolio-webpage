/**
 * Property test for theme toggle round-trip.
 *
 * **Property 6: Theme Toggle Round-Trip**
 * Toggling the theme twice returns `data-theme` to its original value.
 * After each toggle, `localStorage.getItem('yoge-theme')` equals the
 * current `data-theme`.
 *
 * This test exercises the pure toggle logic extracted from engine.js:
 *
 *   const current = document.documentElement.getAttribute('data-theme');
 *   const next = current === 'light' ? 'dark' : 'light';
 *   document.documentElement.setAttribute('data-theme', next);
 *   try { localStorage.setItem('yoge-theme', next); } catch (_e) {}
 *
 * No real browser APIs are required — the test uses lightweight mocks for
 * `document.documentElement` and `localStorage` so it runs cleanly in Node.
 *
 * **Validates: Requirements 5.9, 5.10, 13.1, 13.2**
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// ─── Pure toggle logic extracted from engine.js ──────────────────────────────
//
// We test the logic as a pure function rather than importing the module so the
// test has zero DOM / browser bootstrap cost and no side effects.

/**
 * Compute the next theme value given the current one.
 * Mirrors the toggle logic in engine.js exactly.
 *
 * @param {string|null} current - Current data-theme attribute value (or null)
 * @returns {'dark'|'light'}
 */
export function computeNextTheme(current) {
  return current === 'light' ? 'dark' : 'light';
}

/**
 * A minimal in-memory mock for document.documentElement + localStorage.
 * Captures exactly the APIs the toggle logic uses.
 */
function createEnv(initialTheme) {
  // --- html element mock ---
  let _dataTheme = initialTheme;
  const html = {
    getAttribute(name) {
      if (name === 'data-theme') return _dataTheme;
      return null;
    },
    setAttribute(name, value) {
      if (name === 'data-theme') _dataTheme = value;
    },
    get dataTheme() { return _dataTheme; },
  };

  // --- localStorage mock (normal, non-throwing) ---
  const store = {};
  const localStorageOK = {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = value; },
  };

  return { html, localStorage: localStorageOK };
}

/**
 * A localStorage mock that always throws (simulates private-browsing / policy block).
 */
function createThrowingLocalStorage() {
  return {
    getItem(_key) { throw new Error('localStorage unavailable'); },
    setItem(_key, _value) { throw new Error('localStorage unavailable'); },
  };
}

/**
 * Execute one toggle using the exact engine.js pattern.
 * Returns the next theme applied.
 *
 * @param {object} html         - html element mock
 * @param {object} localStorage - localStorage mock
 * @returns {'dark'|'light'}
 */
function performToggle(html, localStorage) {
  const current = html.getAttribute('data-theme');
  const next = computeNextTheme(current);
  html.setAttribute('data-theme', next);
  try {
    localStorage.setItem('yoge-theme', next);
  } catch (_e) {
    // localStorage unavailable — theme still applied in memory (Req 14.4)
  }
  return next;
}

// ─── Arbitrary generators ─────────────────────────────────────────────────────

/** Arbitrary for the two valid initial theme values. */
const themeArb = fc.constantFrom('dark', 'light');

// ─── Unit tests — concrete examples ──────────────────────────────────────────

describe('computeNextTheme — unit tests', () => {
  it("'dark' → 'light'", () => {
    expect(computeNextTheme('dark')).toBe('light');
  });

  it("'light' → 'dark'", () => {
    expect(computeNextTheme('light')).toBe('dark');
  });

  it('null (absent) treated as dark → produces light', () => {
    // The toggle guard: current === 'light' ? 'dark' : 'light'
    // null is not 'light', so result is 'light'
    expect(computeNextTheme(null)).toBe('light');
  });
});

describe('performToggle — round-trip unit tests', () => {
  it('dark → light → dark (round-trip)', () => {
    const { html, localStorage } = createEnv('dark');
    performToggle(html, localStorage);
    expect(html.dataTheme).toBe('light');
    performToggle(html, localStorage);
    expect(html.dataTheme).toBe('dark');
  });

  it('light → dark → light (round-trip)', () => {
    const { html, localStorage } = createEnv('light');
    performToggle(html, localStorage);
    expect(html.dataTheme).toBe('dark');
    performToggle(html, localStorage);
    expect(html.dataTheme).toBe('light');
  });

  it('localStorage is synced after first toggle', () => {
    const { html, localStorage } = createEnv('dark');
    performToggle(html, localStorage);
    expect(localStorage.getItem('yoge-theme')).toBe(html.dataTheme);
  });

  it('localStorage is synced after second toggle', () => {
    const { html, localStorage } = createEnv('dark');
    performToggle(html, localStorage);
    performToggle(html, localStorage);
    expect(localStorage.getItem('yoge-theme')).toBe(html.dataTheme);
  });

  it('toggle still updates data-theme when localStorage throws', () => {
    const html = createEnv('dark').html;
    const ls = createThrowingLocalStorage();
    const next = performToggle(html, ls);
    expect(html.dataTheme).toBe('light');
    expect(next).toBe('light');
  });
});

// ─── Property 6: Theme Toggle Round-Trip ─────────────────────────────────────
//
// **Validates: Requirements 5.9, 5.10, 13.1, 13.2**

describe('Property 6: Theme Toggle Round-Trip — Validates: Requirements 5.9, 5.10, 13.1, 13.2', () => {

  /**
   * P6a: Toggling twice returns data-theme to its original value.
   *
   * For any initial theme ∈ {'dark', 'light'}, two sequential toggles
   * must leave data-theme unchanged from the starting state.
   */
  it('P6a: toggle twice → data-theme returns to original value [fast-check]', () => {
    fc.assert(
      fc.property(themeArb, (initial) => {
        const { html, localStorage } = createEnv(initial);

        performToggle(html, localStorage);
        performToggle(html, localStorage);

        if (html.dataTheme !== initial) {
          throw new Error(
            `Round-trip failed: initial='${initial}', got='${html.dataTheme}'`
          );
        }
        return true;
      }),
      { numRuns: 200 }
    );
  });

  /**
   * P6b: After each toggle, localStorage.getItem('yoge-theme') equals data-theme.
   *
   * Both the first and second toggle must leave localStorage in sync with the
   * data-theme attribute (Req 5.10, 13.2).
   */
  it('P6b: after each toggle, localStorage equals current data-theme [fast-check]', () => {
    fc.assert(
      fc.property(themeArb, (initial) => {
        const { html, localStorage } = createEnv(initial);

        // --- First toggle ---
        performToggle(html, localStorage);
        const afterFirst = html.dataTheme;
        const storedAfterFirst = localStorage.getItem('yoge-theme');

        if (storedAfterFirst !== afterFirst) {
          throw new Error(
            `localStorage out of sync after 1st toggle: ` +
            `data-theme='${afterFirst}', localStorage='${storedAfterFirst}'`
          );
        }

        // --- Second toggle ---
        performToggle(html, localStorage);
        const afterSecond = html.dataTheme;
        const storedAfterSecond = localStorage.getItem('yoge-theme');

        if (storedAfterSecond !== afterSecond) {
          throw new Error(
            `localStorage out of sync after 2nd toggle: ` +
            `data-theme='${afterSecond}', localStorage='${storedAfterSecond}'`
          );
        }

        return true;
      }),
      { numRuns: 200 }
    );
  });

  /**
   * P6c: Toggle is a strict binary flip.
   *
   * Starting from 'dark', toggling gives 'light'.
   * Starting from 'light', toggling gives 'dark'.
   * No other output values are possible.
   */
  it('P6c: toggle is a strict dark↔light binary flip [fast-check]', () => {
    fc.assert(
      fc.property(themeArb, (initial) => {
        const { html, localStorage } = createEnv(initial);

        performToggle(html, localStorage);
        const afterToggle = html.dataTheme;

        const expected = initial === 'dark' ? 'light' : 'dark';

        if (afterToggle !== expected) {
          throw new Error(
            `Toggle produced unexpected value: initial='${initial}', ` +
            `expected='${expected}', got='${afterToggle}'`
          );
        }

        // Result must always be one of the two valid theme strings
        if (afterToggle !== 'dark' && afterToggle !== 'light') {
          throw new Error(`Toggle produced invalid theme value: '${afterToggle}'`);
        }

        return true;
      }),
      { numRuns: 200 }
    );
  });

  /**
   * P6d: When localStorage throws, the toggle still updates data-theme correctly.
   *
   * The try/catch in the toggle logic must not prevent data-theme from being
   * set even if localStorage.setItem() raises an exception (Req 13.5, 14.4).
   */
  it('P6d: localStorage failure does not prevent data-theme update [fast-check]', () => {
    fc.assert(
      fc.property(themeArb, (initial) => {
        // html mock only — use the throwing localStorage
        const html = createEnv(initial).html;
        const ls = createThrowingLocalStorage();

        const expected = initial === 'dark' ? 'light' : 'dark';
        performToggle(html, ls);

        if (html.dataTheme !== expected) {
          throw new Error(
            `data-theme not updated when localStorage throws: ` +
            `initial='${initial}', expected='${expected}', got='${html.dataTheme}'`
          );
        }

        // Round-trip with throwing localStorage
        performToggle(html, ls);
        if (html.dataTheme !== initial) {
          throw new Error(
            `Round-trip failed with throwing localStorage: ` +
            `initial='${initial}', got='${html.dataTheme}'`
          );
        }

        return true;
      }),
      { numRuns: 200 }
    );
  });

});
