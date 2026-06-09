/**
 * engine.js — Boot lifecycle and GSAP-dependent features
 *
 * This is a standard ES module (no bundler required).
 * Load with: <script type="module" src="js/engine.js">
 *
 * Boot phase order (per Requirement 2.2):
 *   Phase 0 — applyStoredTheme()
 *   Phase 1 — fx.boot()
 *   Phase 2 — initCursor(), initLoading(), initNav(), initScrollScenes(),
 *              initSkillBars(), initResultCards()
 */

// ─── Phase 0: Theme Persistence ──────────────────────────────────────────────

/**
 * Reads the stored theme from localStorage and applies it to <html>
 * before the first CSS paint, preventing a flash of the wrong theme.
 *
 * Requirements: 5.11, 13.3, 13.5, 14.4
 *
 * - On success with a non-null value: sets data-theme on <html>
 * - On null (key absent):             no-op — dark theme is the default
 * - On localStorage exception:        no-op — defaults to dark for this session
 */
function applyStoredTheme() {
  try {
    const theme = localStorage.getItem('yoge-theme');
    if (theme !== null) {
      document.documentElement.setAttribute('data-theme', theme);
    }
    // If theme is null the key is absent — leave data-theme unset (dark default)
  } catch (_e) {
    // localStorage unavailable (e.g. private browsing, security policy)
    // Silently default to dark theme for this session — no rethrow
  }
}

/**
 * Wires the #themeToggle button to toggle data-theme between 'dark' and 'light'
 * and persist the new value to localStorage.
 *
 * Requirements: 5.9, 5.10, 13.4, 13.5
 */
function initThemeToggle() {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    // If data-theme is absent or 'dark', switch to 'light'; otherwise switch to 'dark'
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);

    try {
      localStorage.setItem('yoge-theme', next);
    } catch (_e) {
      // localStorage unavailable — theme is applied in memory for this session only
    }
  });
}

// ─── Placeholder functions — implemented in future tasks ─────────────────────

/**
 * initCursor() — custom cursor dot + ring (desktop fine-pointer only)
 * Implemented in task 11.3
 * Requirements: 8.1, 8.4
 */
function initCursor() {
  // TODO: task 11.3
}

/**
 * initLoading() — loading screen dismiss lifecycle
 * Implemented in task 11.4
 * Requirements: 3.1–3.6
 */
function initLoading() {
  // TODO: task 11.4
}

/**
 * initNav() — navigation scrollspy, progress bar, mobile drawer
 * Implemented in task 11.8
 * Requirements: 5.1–5.8, 5.11
 */
function initNav() {
  // TODO: task 11.8
}

/**
 * initScrollScenes() — all GSAP scroll-triggered entrance animations
 * Implemented in task 11.11
 * Requirements: 6.1–6.7, 14.5
 */
function initScrollScenes() {
  // TODO: task 11.11
}

/**
 * initSkillBars() — IntersectionObserver-driven skill bar animations
 * Implemented in task 11.14
 * Requirements: 10.1–10.3
 */
function initSkillBars() {
  // TODO: task 11.14
}

/**
 * initResultCards() — result card bar + counter animations (Discovery section)
 * Implemented in task 11.16
 */
function initResultCards() {
  // TODO: task 11.16
}

// ─── Boot entry point ─────────────────────────────────────────────────────────

/**
 * boot() — main engine initialisation, called at most once per page load.
 *
 * Phase order (Requirement 2.2):
 *   Phase 0 — applyStoredTheme()     (sync, before any side effects)
 *   Phase 1 — fx.boot()              (effects layer, no GSAP dependency)
 *   Phase 2 — initCursor(), initLoading(), initNav(), initScrollScenes(),
 *              initSkillBars(), initResultCards()
 *
 * Requirements: 2.1, 2.2, 2.4, 2.5
 */
let _booted = false;

function boot() {
  // Requirement 2.4 — call boot() at most once per page load
  if (_booted) return;
  _booted = true;

  // Phase 0: apply stored theme before any visual side effects
  applyStoredTheme();
  initThemeToggle();

  // Phase 1: effects layer (fx.js — no GSAP dependency)
  // fx.boot() is called here when fx.js is implemented (task 9.12)
  if (typeof window.fxBoot === 'function') {
    window.fxBoot();
  }

  // Phase 2: GSAP-dependent engine features
  initCursor();
  initLoading();
  initNav();
  initScrollScenes();
  initSkillBars();
  initResultCards();
}

// ─── Auto-boot on DOM ready (Requirement 2.1) ────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  // readyState is 'interactive' or 'complete' — boot immediately
  boot();
}

// ─── Named exports for testing ───────────────────────────────────────────────

export {
  applyStoredTheme,
  initThemeToggle,
  initCursor,
  initLoading,
  initNav,
  initScrollScenes,
  initSkillBars,
  initResultCards,
  boot,
};
