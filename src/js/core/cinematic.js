/**
 * CINEMATIC LAYER
 * ---------------
 * Makes the DOM content itself feel like a scene-by-scene journey rather than
 * flat text over an animated backdrop:
 *
 *   1. Chapter interstitials — as you cross into a chapter, a large scene
 *      marker (numeral + title) sweeps in and fades, like a film chapter card.
 *   2. Scroll-velocity skew — headings lean in the direction of travel on a
 *      hard flick, then settle (the award-site "kinetic type" feel).
 *   3. Depth parallax — kickers and ghost numerals drift at their own speed so
 *      each chapter has real front-to-back depth.
 *
 * Progressive enhancement: if GSAP is unavailable or the visitor prefers
 * reduced motion, none of this runs and the content reads normally. All motion
 * is transform/opacity only, and it is disabled on perf-lite devices.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHAPTERS } from "../config/chapters.js";
import { paletteFor, themeOf } from "./palettes.js";
import { prefersReducedMotion } from "../utils.js";

gsap.registerPlugin(ScrollTrigger);

export function initCinematic() {
  if (prefersReducedMotion()) return;
  const liteAtStart = document.documentElement.classList.contains("perf-lite");

  buildInterstitial();
  buildSceneWipe();

  const ctx = gsap.context(() => {
    setupInterstitials();
    setupVelocitySkew();
    setupDepthParallax(liteAtStart);
  });

  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());

  return () => ctx.revert();
}

/* ------------------------------------------------------------------ */
/* Chapter interstitial element                                       */
/* ------------------------------------------------------------------ */

let interstitialEl = null;
let sceneWipeEl = null;

function buildInterstitial() {
  interstitialEl = document.createElement("div");
  interstitialEl.className = "interstitial";
  interstitialEl.setAttribute("aria-hidden", "true");
  interstitialEl.innerHTML = `
    <div class="interstitial__inner">
      <span class="interstitial__numeral"></span>
      <span class="interstitial__title"></span>
      <span class="interstitial__rule"></span>
      <span class="interstitial__kicker"></span>
    </div>`;
  document.body.appendChild(interstitialEl);
}

function buildSceneWipe() {
  sceneWipeEl = document.createElement("div");
  sceneWipeEl.className = "scene-wipe";
  sceneWipeEl.setAttribute("aria-hidden", "true");
  document.body.appendChild(sceneWipeEl);
}

/**
 * Show the scene marker for a chapter. A quick, self-contained timeline:
 * numeral + title rise and fade, the rule draws across, then everything
 * clears so it never blocks reading.
 */
let lastShown = -1;
let markerTl = null;

function showMarker(chapter) {
  if (!interstitialEl || chapter.index === lastShown) return;
  lastShown = chapter.index;

  const inner = interstitialEl.querySelector(".interstitial__inner");
  const numeral = interstitialEl.querySelector(".interstitial__numeral");
  const title = interstitialEl.querySelector(".interstitial__title");
  const kicker = interstitialEl.querySelector(".interstitial__kicker");
  const rule = interstitialEl.querySelector(".interstitial__rule");

  numeral.textContent = chapter.numeral;
  title.textContent = chapter.title;
  kicker.textContent = chapter.kicker;

  markerTl?.kill();
  markerTl = gsap.timeline({
    onStart: () => interstitialEl.classList.add("is-active"),
    onComplete: () => interstitialEl.classList.remove("is-active"),
  });

  markerTl
    .set(interstitialEl, { opacity: 1 })
    .fromTo(inner, { y: 30, scale: 0.98 }, { y: 0, scale: 1, duration: 0.55, ease: "power3.out" }, 0)
    .fromTo([numeral, title], { opacity: 0, y: 22 }, { opacity: (i) => (i === 0 ? 0.5 : 1), y: 0, duration: 0.5, ease: "power3.out", stagger: 0.06 }, 0.02)
    .fromTo(kicker, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.18)
    .fromTo(rule, { width: 0 }, { width: 120, duration: 0.5, ease: "power2.inOut" }, 0.15)
    .to(interstitialEl, { opacity: 0, duration: 0.5, ease: "power2.in" }, 0.82);
}

function flashSceneWipe(chapter) {
  if (!sceneWipeEl) return;
  const accent = paletteFor(chapter.palette, themeOf()).accent;
  sceneWipeEl.style.setProperty("--ch-accent", accent);
  gsap.killTweensOf(sceneWipeEl);
  gsap.timeline()
    .set(sceneWipeEl, { scaleX: 0, opacity: 1, transformOrigin: "left" })
    .to(sceneWipeEl, { scaleX: 1, duration: 0.5, ease: "power2.inOut" })
    .set(sceneWipeEl, { transformOrigin: "right" })
    .to(sceneWipeEl, { scaleX: 0, duration: 0.45, ease: "power2.inOut" })
    .set(sceneWipeEl, { opacity: 0 });
}

/**
 * Fire the marker when each chapter's heading crosses the top third of the
 * viewport — anchored to the reading line, not raw scroll fraction, so a
 * tall chapter still triggers exactly once (per the award-site pattern).
 * The very first chapter (arrival) never gets a marker — it *is* the opening.
 */
function setupInterstitials() {
  CHAPTERS.forEach((chapter) => {
    if (chapter.index === 1) return;
    const section = document.getElementById(`chapter-${chapter.id}`);
    if (!section) return;

    ScrollTrigger.create({
      trigger: section,
      // Fire as the chapter's top rises into the lower viewport — the marker
      // plays and clears before the copy reaches the reading line, so the two
      // never compete for attention.
      start: "top 82%",
      onEnter: () => {
        showMarker(chapter);
        flashSceneWipe(chapter);
      },
      onEnterBack: () => flashSceneWipe(chapter),
    });
  });
}

/* ------------------------------------------------------------------ */
/* Scroll-velocity skew on headings                                    */
/* ------------------------------------------------------------------ */

function setupVelocitySkew() {
  // Skip the per-scroll skew work on weak devices — the parallax + reveals
  // already carry the motion there.
  if (document.documentElement.classList.contains("perf-lite")) return;
  const targets = gsap.utils.toArray("[data-skew]");
  if (!targets.length) return;

  const setters = targets.map((el) => gsap.quickTo(el, "skewY", { duration: 0.5, ease: "power3" }));
  const ySetters = targets.map((el) => gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" }));

  let clamp = gsap.utils.clamp(-3.2, 3.2);

  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = clamp(self.getVelocity() / -320);
      targets.forEach((_, i) => {
        setters[i](v);
        ySetters[i](Math.abs(v) * 0.8);
      });
    },
  });
}

/* ------------------------------------------------------------------ */
/* Depth parallax on kickers + ghost numerals                          */
/* ------------------------------------------------------------------ */

function setupDepthParallax(lite) {
  // Ghost chapter numerals drift slowly (they sit "behind" the content).
  gsap.utils.toArray(".chapter__numeral").forEach((el) => {
    gsap.fromTo(
      el,
      { yPercent: -8 },
      {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest(".chapter"),
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      },
    );
  });

  if (lite) return; // skip the finer parallax on weak devices

  // Kickers drift up a touch faster than the copy, adding front depth.
  gsap.utils.toArray(".chapter__head .kicker").forEach((el) => {
    gsap.fromTo(
      el,
      { y: 24 },
      {
        y: -24,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest(".chapter__head"),
          start: "top bottom",
          end: "bottom top",
          scrub: 1.2,
        },
      },
    );
  });
}
