/**
 * FOCUS / SPOTLIGHT
 * -----------------
 * The heart of the "one thing at a time" storytelling. Instead of a wall of
 * text where everything is equally visible, each sequence of items (pillars,
 * pipeline steps, project phases, milestones, monuments, instruments, mindset
 * steps) becomes a spotlight: as you scroll, only the item nearest the centre
 * of the viewport is fully lit and slightly enlarged; the rest recede.
 *
 * This is pure progressive enhancement — it toggles a single class per item,
 * so with JS or motion disabled everything simply reads at full clarity.
 *
 * Performance: one rAF-throttled scroll handler drives all sequences; it reads
 * geometry in a single batched pass and only writes classes that change.
 */

import { prefersReducedMotion } from "../utils.js";

/* Sequences that read as a spotlight (one item at a time). Deliberately
   excludes project phases — those are connected prose within a card and must
   stay fully legible together, not dim each other out. */
const SEQUENCES = [
  ".person__pillars > .pillar",
  ".pipeline > .pipeline__step",
  ".milestones > .milestone",
  ".monuments > .monument",
  ".instruments > .instrument",
  ".mindset__track > .mindset__step",
];

export function initFocus() {
  if (prefersReducedMotion()) return () => {};

  // Collect every group of siblings we want to spotlight.
  const groups = [];
  SEQUENCES.forEach((selector) => {
    const items = Array.from(document.querySelectorAll(selector));
    if (items.length < 2) return;
    // Group by parent so each list spotlights independently.
    const byParent = new Map();
    items.forEach((el) => {
      const parent = el.parentElement;
      if (!byParent.has(parent)) byParent.set(parent, []);
      byParent.get(parent).push(el);
      el.classList.add("focusable");
    });
    byParent.forEach((list) => groups.push(list));
  });

  if (!groups.length) return () => {};

  let scheduled = false;
  const focusState = new WeakMap();

  const measure = () => {
    scheduled = false;
    const center = window.innerHeight * 0.46;

    for (const list of groups) {
      // Is any part of this group near the viewport? Cheap early-out.
      const first = list[0].getBoundingClientRect();
      const last = list[list.length - 1].getBoundingClientRect();
      const onScreen = last.top < window.innerHeight * 1.1 && first.bottom > -window.innerHeight * 0.1;
      if (!onScreen) {
        // Clear focus when the group leaves so nothing is stuck lit.
        list.forEach((el) => {
          if (focusState.get(el)) {
            el.classList.remove("is-focus");
            el.classList.remove("is-dim");
            focusState.set(el, false);
          }
        });
        continue;
      }

      // Find the item whose centre is closest to the reading line.
      let best = null;
      let bestDist = Infinity;
      const rects = list.map((el) => {
        const r = el.getBoundingClientRect();
        const mid = r.top + r.height / 2;
        const dist = Math.abs(mid - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = el;
        }
        return { el, visible: r.bottom > 0 && r.top < window.innerHeight };
      });

      // Only spotlight while the group is genuinely in the reading zone.
      const groupActive = first.top < window.innerHeight * 0.8 && last.bottom > window.innerHeight * 0.2;

      rects.forEach(({ el, visible }) => {
        const isFocus = groupActive && el === best && visible;
        const isDim = groupActive && el !== best && visible;
        const prev = focusState.get(el);
        const nextState = isFocus ? "focus" : isDim ? "dim" : "";
        if (prev === nextState) return;
        focusState.set(el, nextState);
        el.classList.toggle("is-focus", isFocus);
        el.classList.toggle("is-dim", isDim);
      });
    }
  };

  const onScroll = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(measure);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  // Run once after layout settles.
  requestAnimationFrame(measure);
  if (document.fonts?.ready) document.fonts.ready.then(() => requestAnimationFrame(measure));

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}
