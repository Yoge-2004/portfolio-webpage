/**
 * BOOTSTRAP
 * ---------
 * Assembles the experience: engine → stations → choreography →
 * navigation → scroll → interactions. If any 3D step fails, the site
 * still works as a static, fully-readable story.
 */

// NOTE: the stylesheet is loaded via <link rel="stylesheet"> in index.html —
// never through JavaScript — so the site is styled even if this module fails.
import { createEngine } from "./core/engine.js";
import { Choreography } from "./core/choreography.js";
import { Navigation } from "./core/navigation.js";
import { initScroll } from "./core/scroll.js";
import { initStoryAnimations } from "./core/story-animations.js";
import { initFocus } from "./core/focus.js";
import { initCinematic } from "./core/cinematic.js";
import { initTheme } from "./core/theme.js";
import { initMotion } from "./core/motion.js";
import {
  initStoryText,
  initReveals,
  initCounters,
  initMagnetic,
  initCursor,
  initTechnicalLinks,
  initDetector,
  initConsoles,
  initChrome,
  dismissBoot,
} from "./interactions.js";
import { CHAPTERS } from "./config/chapters.js";
import { prefersReducedMotion } from "./utils.js";

const $ = (id) => document.getElementById(id);

function markNoWebgl() {
  document.documentElement.classList.add("no-webgl");
}

function setFooterYear() {
  const el = $("footer-year");
  if (el) el.textContent = String(new Date().getFullYear());
}

/**
 * Static-quality guarantee.
 *
 * `data-reveal` is only ever added by JavaScript, so with scripting disabled
 * nothing is hidden and the whole story reads as plain HTML. Here we simply
 * declare the first chapter as active so the DOM accent is defined from the
 * very first paint.
 */
function primeStaticState() {
  document.documentElement.dataset.activeChapter = CHAPTERS[0].id;
}

function boot() {
  // Dismiss the boot curtain first. If anything below throws, the visitor is
  // never left staring at a loading screen. A CSS failsafe covers the case
  // where this file itself fails to execute.
  dismissBoot();
  setFooterYear();

  const canvas = $("stage-canvas");
  const contentRoot = $("main");

  // Theme first (default dark): the pre-paint script already set
  // <html data-theme>, so the engine + stations boot in the right theme.
  // The onChange handler re-aims the 3D world + tab colour on toggle.
  let engine = null;
  let navigation = null;
  const theme = initTheme((next) => {
    engine?.environment.setTheme(next);
    navigation?.refreshThemeColor();
  });

  engine = createEngine(canvas);

  // Flag lower-tier devices so expensive effects (backdrop blur) are dropped
  // to a solid surface. Keeps 60fps on modest hardware without changing the
  // desktop look.
  if (engine && engine.tier === "low") {
    document.documentElement.classList.add("perf-lite");
  }

  // ---- Navigation is always built, WebGL or not ----
  navigation = new Navigation({
    topbarList: $("topbar-list"),
    drawerList: $("drawer-list"),
    rail: $("hud-rail"),
    meterNum: $("hud-chapter-num"),
    meterTitle: $("hud-chapter-title"),
    meterFill: $("hud-progress-fill"),
    menuToggle: $("menu-toggle"),
    drawer: $("chapter-drawer"),
    topbar: $("topbar"),
  });
  // Sync the tab colour to the opening chapter in the active theme.
  navigation.refreshThemeColor();

  let choreography = null;

  if (engine) {
    engine.resize();
    choreography = new Choreography({
      engine,
      contentRoot,
      onChapterChange: (chapter, index) => navigation.setActive(chapter, index),
    });

    try {
      choreography.build();
      // Stations are built with dark-theme materials; if the visitor is in
      // light theme (restored pre-paint), re-tone every mesh right away so
      // the first visible frame already matches.
      engine.environment.setTheme();
    } catch (error) {
      console.warn("[bootstrap] 3D scene failed to build; continuing without it.", error);
      markNoWebgl();
      choreography = null;
    }
  } else {
    markNoWebgl();
  }

  // ---- Scroll (Lenis + ScrollTrigger, or native when reduced motion) ----
  const scroll = initScroll({
    onProgress: (ratio) => navigation.setProgress(ratio),
  });

  // ---- Interactions ----
  initChrome();
  initMotion();
  initStoryText();
  initReveals();
  initCounters();
  initMagnetic();
  initCursor();
  initTechnicalLinks();
  initDetector();
  initConsoles();
  initStoryAnimations();
  initFocus();
  initCinematic();
  primeStaticState();

  // ---- Render loop ----
  if (engine && choreography) {
    // The choreography drives the camera and every station each frame.
    engine.onFrame = (delta, time) => choreography.update(delta, time);

    window.addEventListener(
      "pointermove",
      (e) => {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        engine.setPointer(nx, ny);
      },
      { passive: true },
    );

    // Pause rendering when the tab is hidden — saves battery and GPU.
    document.addEventListener("visibilitychange", () => {
      engine.visible = !document.hidden;
      if (!document.hidden) engine.clock.getDelta();
    });

    engine.start();
  }

  // ---- Resize: rebuild the scroll mapping so chapters never desync ----
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      engine?.resize();
      choreography?.refresh();
    }, 180);
  });

  // Reduced-motion users get the full content with no camera travel.
  if (prefersReducedMotion()) {
    document.documentElement.classList.add("is-reduced-motion");
  }

  // Expose for debugging in the console.
  window.__portfolio = { engine, choreography, navigation, scroll, theme };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
