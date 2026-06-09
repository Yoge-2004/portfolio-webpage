/**
 * Property test for CSS token clamp validity.
 *
 * Property 12: clamp Token Validity
 * For every clamp(min, preferred, max) expression in tokens.css,
 * the constraint min ≤ preferred ≤ max holds.
 *
 * How CSS clamp() works:
 *   clamp(MIN, VAL, MAX)  ≡  max(MIN, min(VAL, MAX))
 *
 * The "preferred" operand is a fluid vw expression. By definition:
 *   - When the viewport is narrow, preferred < min → browser uses MIN (floor kicks in)
 *   - When the viewport is wide,   preferred > max → browser uses MAX (ceiling kicks in)
 *   - In between: preferred is used as-is (fluid zone)
 *
 * The spec requirement "min ≤ preferred ≤ max" means the three operands must
 * form a valid range where the fluid zone is reachable, i.e.:
 *   P12a: min ≤ max          — bounds are non-inverted (required for clamp to be valid)
 *   P12b: ∃ viewport width where min ≤ preferred(vw) ≤ max
 *          — the fluid zone is reachable (non-empty)
 *
 * The "viewport at which preferred = min" is: vp_min = min_px / vw_factor * 100
 * The "viewport at which preferred = max" is: vp_max = max_px / vw_factor * 100
 * For a valid fluid range: vp_min ≤ vp_max  ↔  min ≤ max  (same as P12a)
 *
 * Additionally we verify:
 *   P12c: at the standard reference viewport (1024px), min ≤ preferred ≤ max
 *          — the tokens are authored correctly for the primary design viewport
 *
 *   P12d: for any viewport in [vp_min, vp_max], min ≤ preferred(vw) ≤ max
 *          — fast-check verifies the fluid zone is correct when the viewport
 *            is constrained to the token's own fluid range
 *
 * Validates: Requirements 1.4
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse a fixed px value string into a number.
 * @param {string} value  e.g. "16px"
 * @returns {number}
 */
function parsePx(value) {
  const trimmed = value.trim();
  if (!trimmed.endsWith('px')) {
    throw new Error(`Expected px value, got: "${value}"`);
  }
  return parseFloat(trimmed);
}

/**
 * Resolve a vw expression at a given viewport width.
 * Also accepts bare px values (treated as constant preferred — unusual but handled).
 * @param {string} value    e.g. "1.5vw"
 * @param {number} vpWidth  viewport width in px
 * @returns {number}
 */
function resolvePreferred(value, vpWidth) {
  const trimmed = value.trim();
  if (trimmed.endsWith('vw')) {
    return (parseFloat(trimmed) / 100) * vpWidth;
  }
  if (trimmed.endsWith('px')) {
    return parseFloat(trimmed);
  }
  throw new Error(`Unsupported CSS unit in clamp preferred: "${value}"`);
}

/**
 * Extract all clamp(...) declarations from CSS text.
 * For each: parse min/max as fixed px, keep preferred as raw string.
 *
 * @param {string} cssText
 * @returns {{ property: string, minPx: number, preferredRaw: string,
 *             maxPx: number, vwFactor: number|null }[]}
 */
function extractClampTokens(cssText) {
  const tokens = [];
  const re = /(--[\w-]+)\s*:\s*clamp\(([^)]+)\)/g;
  let m;

  while ((m = re.exec(cssText)) !== null) {
    const property = m[1];
    const args = m[2].split(',').map((s) => s.trim());

    if (args.length !== 3) {
      throw new Error(`Malformed clamp() for ${property}: expected 3 args, got ${args.length}`);
    }

    const [minRaw, preferredRaw, maxRaw] = args;
    const minPx = parsePx(minRaw);
    const maxPx = parsePx(maxRaw);

    // Extract the vw factor (null if preferred is a fixed px — unusual)
    let vwFactor = null;
    if (preferredRaw.endsWith('vw')) {
      vwFactor = parseFloat(preferredRaw) / 100;
    }

    tokens.push({ property, minPx, preferredRaw, maxPx, vwFactor });
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// Load tokens.css
// ---------------------------------------------------------------------------

const tokensPath = join(__dirname, '..', 'css', 'tokens.css');
const cssText = readFileSync(tokensPath, 'utf-8');
const clampTokens = extractClampTokens(cssText);

// ---------------------------------------------------------------------------
// Unit tests — sanity checks on extracted tokens
// ---------------------------------------------------------------------------

describe('tokens.css — clamp extraction', () => {
  it('finds at least 10 clamp() tokens in tokens.css', () => {
    expect(clampTokens.length).toBeGreaterThanOrEqual(10);
  });

  it('includes all expected spacing token names', () => {
    const names = clampTokens.map((t) => t.property);
    const expected = [
      '--space-2xs', '--space-xs',  '--space-sm',  '--space-md',
      '--space-lg',  '--space-xl',  '--space-2xl', '--space-3xl',
      '--section-py', '--container-px',
    ];
    for (const name of expected) {
      expect(names, `Expected token ${name} to be present`).toContain(name);
    }
  });
});

// ---------------------------------------------------------------------------
// Property 12: clamp Token Validity — Validates: Requirements 1.4
// ---------------------------------------------------------------------------

describe('Property 12: clamp Token Validity — Validates: Requirements 1.4', () => {

  // P12a: min ≤ max — bounds must not be inverted
  it('P12a: min ≤ max for every clamp token (bounds are non-inverted)', () => {
    for (const token of clampTokens) {
      expect(
        token.minPx,
        `${token.property}: min(${token.minPx}px) > max(${token.maxPx}px) — bounds are inverted`
      ).toBeLessThanOrEqual(token.maxPx);
    }
  });

  // P12c: at the primary design reference viewport (1024px), min ≤ preferred ≤ max
  it('P12c: min ≤ preferred ≤ max at the design reference viewport (1024px)', () => {
    const REF_VP = 1024;
    for (const token of clampTokens) {
      const prefPx = resolvePreferred(token.preferredRaw, REF_VP);
      expect(
        token.minPx,
        `${token.property}: min(${token.minPx}px) > preferred(${prefPx.toFixed(2)}px) at ${REF_VP}px`
      ).toBeLessThanOrEqual(prefPx);
      expect(
        prefPx,
        `${token.property}: preferred(${prefPx.toFixed(2)}px) > max(${token.maxPx}px) at ${REF_VP}px`
      ).toBeLessThanOrEqual(token.maxPx);
    }
  });

  // P12d: within each token's own fluid zone [vp_min, vp_max], min ≤ preferred ≤ max
  //
  // The fluid zone for a clamp(MIN, N*vw, MAX) token is:
  //   vp_min = MIN / (N/100) = MIN * 100/N  px  (where preferred first exceeds MIN)
  //   vp_max = MAX / (N/100) = MAX * 100/N  px  (where preferred first reaches MAX)
  //
  // fast-check generates a viewport width within [vp_min, vp_max] for each token
  // and asserts the constraint holds exactly in that range.
  it('P12d: min ≤ preferred ≤ max within each token\'s own fluid zone [fast-check]', () => {
    fc.assert(
      fc.property(
        // Generate a float between 0 and 1 (used as interpolation factor within fluid zone)
        fc.float({ min: 0, max: 1, noNaN: true }),
        (t) => {
          for (const token of clampTokens) {
            if (token.vwFactor === null) continue; // skip non-vw preferred values

            // Fluid zone endpoints
            const vpMin = token.minPx / token.vwFactor;  // vp where preferred = min
            const vpMax = token.maxPx / token.vwFactor;  // vp where preferred = max

            // Interpolate a viewport width within the fluid zone
            const vp = vpMin + t * (vpMax - vpMin);
            const prefPx = resolvePreferred(token.preferredRaw, vp);

            // Within the fluid zone, preferred must be between min and max
            if (prefPx < token.minPx - 0.001) {
              throw new Error(
                `${token.property}: preferred(${prefPx.toFixed(3)}px) < min(${token.minPx}px) ` +
                `inside fluid zone at viewport ${vp.toFixed(1)}px`
              );
            }
            if (prefPx > token.maxPx + 0.001) {
              throw new Error(
                `${token.property}: preferred(${prefPx.toFixed(3)}px) > max(${token.maxPx}px) ` +
                `inside fluid zone at viewport ${vp.toFixed(1)}px`
              );
            }
          }
          return true;
        }
      ),
      { numRuns: 2000 }
    );
  });

  // Concrete check: the design reference viewport (1024px) falls within every token's fluid zone
  it('design viewport 1024px falls within the fluid zone of every vw-based clamp token', () => {
    const REF_VP = 1024;
    for (const token of clampTokens) {
      if (token.vwFactor === null) continue;
      const vpMin = token.minPx / token.vwFactor;
      const vpMax = token.maxPx / token.vwFactor;
      expect(
        REF_VP,
        `${token.property}: fluid zone is [${vpMin.toFixed(0)}px, ${vpMax.toFixed(0)}px] — ` +
        `design viewport 1024px is outside this range`
      ).toBeGreaterThanOrEqual(vpMin);
      expect(REF_VP).toBeLessThanOrEqual(vpMax);
    }
  });
});
