/**
 * MOTION — foreground micro-interactions
 * --------------------------------------
 * Everything here animates DOM elements (never the WebGL background):
 *
 *   1. 3D tilt — cards tip toward the pointer with a lerped, springy follow
 *      and a cursor-tracked glare sweep. Fine pointers only.
 *   2. Spotlight — a cursor-tracked radial highlight on cards via --mx/--my.
 *   3. Scroll progress hairline — a 2px accent bar pinned to the viewport top.
 *
 * Performance rules: transform/opacity custom-properties only (compositor),
 * one shared rAF loop for all tilt cards, work skipped when the pointer is
 * still, and everything disabled under reduced motion / coarse pointers /
 * perf-lite (tilt + spotlight only; the progress hairline always runs since
 * it is pure scroll state).
 */

import { prefersReducedMotion } from "../utils.js";

const TILT_SEL = ".pillar, .domain, .satellite, .instrument, .console, .stat";
const MAX_TILT = 7; // degrees
const LIFT = 6; // px

export function initMotion() {
  initScrollProgress();
  if (prefersReducedMotion()) return;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
  if (document.documentElement.classList.contains("perf-lite")) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  initTilt();
}

/* ------------------------------------------------------------------ */
/* Scroll progress hairline                                           */
/* ------------------------------------------------------------------ */

function initScrollProgress() {
  let bar = document.getElementById("scroll-progress");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "scroll-progress";
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
  }
  const fill = bar.firstElementChild ?? (() => {
    const f = document.createElement("span");
    f.className = "scroll-progress__fill";
    bar.appendChild(f);
    return f;
  })();

  let scheduled = false;
  const write = () => {
    scheduled = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    fill.style.transform = `scaleX(${p.toFixed(4)})`;
  };
  const onScroll = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(write);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  write();
}

/* ------------------------------------------------------------------ */
/* 3D tilt + spotlight                                                */
/* ------------------------------------------------------------------ */

function initTilt() {
  const cards = Array.from(document.querySelectorAll(TILT_SEL));
  if (!cards.length) return;

  // One shared glare node per card (aria-hidden, reused — no per-move DOM).
  cards.forEach((card) => {
    card.classList.add("tiltable");
    if (!card.querySelector(".tilt-glare")) {
      const glare = document.createElement("span");
      glare.className = "tilt-glare";
      glare.setAttribute("aria-hidden", "true");
      card.appendChild(glare);
    }
  });

  let active = null;
  let leaving = false;
  let tx = 0, ty = 0, cx = 0, cy = 0; // target / current tilt
  let gx = 50, gy = 50; // glare position (%)
  let rafId = 0;
  let running = false;

  const loop = () => {
    if (!active) {
      running = false;
      rafId = 0;
      return;
    }
    cx += (tx - cx) * 0.16;
    cy += (ty - cy) * 0.16;
    const settled = Math.abs(tx - cx) < 0.02 && Math.abs(ty - cy) < 0.02;
    if (settled) {
      cx = tx;
      cy = ty;
    }
    active.style.setProperty("--rx", `${cx.toFixed(3)}deg`);
    active.style.setProperty("--ry", `${cy.toFixed(3)}deg`);
    if (settled && leaving) {
      // Eased fully flat — release the card and park the loop.
      active.classList.remove("is-tilting");
      active = null;
      leaving = false;
      running = false;
      rafId = 0;
      return;
    }
    if (!settled) {
      rafId = requestAnimationFrame(loop);
      return;
    }
    running = false;
    rafId = 0;
  };

  const kick = () => {
    if (!running) {
      running = true;
      rafId = requestAnimationFrame(loop);
    }
  };

  cards.forEach((card) => {
    card.addEventListener(
      "pointerenter",
      (e) => {
        if (e.pointerType === "touch") return;
        active = card;
        leaving = false;
        card.classList.add("is-tilting");
        update(e, card);
        kick();
      },
      { passive: true },
    );
    card.addEventListener(
      "pointermove",
      (e) => {
        if (e.pointerType === "touch" || active !== card) return;
        update(e, card);
        kick();
      },
      { passive: true },
    );
    const release = () => {
      if (active !== card) return;
      // Ease back to flat through the loop instead of snapping.
      tx = 0;
      ty = 0;
      leaving = true;
      kick();
    };
    card.addEventListener("pointerleave", release, { passive: true });
    card.addEventListener("pointercancel", release, { passive: true });
  });

  function update(e, card) {
    const r = card.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const px = (e.clientX - r.left) / r.width; // 0..1
    const py = (e.clientY - r.top) / r.height;
    ty = (0.5 - px) * MAX_TILT; // yaw toward the pointer, ±3.5°
    tx = (py - 0.5) * MAX_TILT; // pitch toward the pointer, ±3.5°
    // Keep a subtle lift while tilted.
    card.style.setProperty("--tl", `${LIFT}px`);
    gx = Math.round(px * 100);
    gy = Math.round(py * 100);
    card.style.setProperty("--mx", `${gx}%`);
    card.style.setProperty("--my", `${gy}%`);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      running = false;
      rafId = 0;
    }
  });
}
