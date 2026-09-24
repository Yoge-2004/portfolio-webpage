/**
 * THEME — light / dark
 * ---------------------
 * Default is dark. The visitor's choice persists in localStorage ("ym-theme")
 * and is restored pre-paint by an inline script in <head> so the first paint
 * never flashes the wrong theme.
 *
 * Switching updates:
 *   · <html data-theme>            → re-skins every --ch-* token + overrides
 *   · all [data-theme-toggle] UIs  → icon morph, label, aria-pressed
 *   · `ym:theme` CustomEvent       → lets any module react (3D, tab colour)
 *   · `html.theme-switching` class → melts surfaces between themes (~650ms)
 *
 * The 3D world itself is re-aimed by the bootstrap onChange handler via
 * `engine.environment.setTheme()`, which blends the current chapter's light
 * palette instead of rebuilding any geometry.
 */

const STORAGE_KEY = "ym-theme";
const SWITCH_MS = 650;

export function currentTheme() {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function readStored() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function store(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* private mode — theme simply won't persist */
  }
}

function syncToggles(theme) {
  const light = theme === "light";
  const pressed = String(light);
  const label = light ? "Dark" : "Light";
  const aria = light ? "Switch to dark theme" : "Switch to light theme";
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    // Idempotent writes only: re-assigning an identical attribute is fine,
    // but blindly rewriting textContent would re-trigger any childList
    // observers — writes must never be able to loop.
    if (btn.getAttribute("aria-pressed") !== pressed) btn.setAttribute("aria-pressed", pressed);
    if (btn.getAttribute("aria-label") !== aria) btn.setAttribute("aria-label", aria);
    if (btn.title !== aria) btn.title = aria;
    const labelEl = btn.querySelector(".theme-toggle__label");
    if (labelEl && labelEl.textContent !== label) labelEl.textContent = label;
  });
}

export function applyTheme(theme, { animate = true } = {}) {
  const next = theme === "light" ? "light" : "dark";
  const root = document.documentElement;
  if (root.dataset.theme === next) {
    syncToggles(next);
    return next;
  }

  if (animate) {
    root.classList.add("theme-switching");
    window.setTimeout(() => root.classList.remove("theme-switching"), SWITCH_MS + 60);
  }
  root.dataset.theme = next;
  store(next);
  syncToggles(next);
  window.dispatchEvent(new CustomEvent("ym:theme", { detail: { theme: next } }));
  return next;
}

export function toggleTheme() {
  return applyTheme(currentTheme() === "light" ? "dark" : "light");
}

/**
 * Binds every [data-theme-toggle] button and syncs initial UI.
 * `onChange(theme)` fires after each switch (3D + tab colour live here).
 */
export function initTheme(onChange) {
  // The pre-paint script owns the initial value; honour it (default dark).
  const initial = currentTheme() === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = initial;
  syncToggles(initial);

  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = toggleTheme();
      onChange?.(next);
    });
  });

  // NOTE: no MutationObserver here on purpose. Watching the whole body while
  // rewriting node text created a self-triggering microtask loop that froze
  // the page — the toggles are static markup, so they never need re-syncing.

  return { get: currentTheme, set: (t) => { const n = applyTheme(t); onChange?.(n); }, toggle: () => { const n = toggleTheme(); onChange?.(n); } };
}
