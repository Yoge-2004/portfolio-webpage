/**
 * STORY ANIMATIONS
 * ----------------
 * GSAP-powered, scroll-scrubbed enhancements that give the narrative its
 * cinematic feel. These are progressive enhancement: if GSAP is unavailable
 * or the visitor prefers reduced motion, the CSS-based reveals still carry the
 * story. Everything here follows GSAP's performance guidance — transforms and
 * opacity only, `scrub` for scroll-linked motion, batched where possible, and
 * `will-change` applied only to elements actually being animated.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "../utils.js";

gsap.registerPlugin(ScrollTrigger);

export function initStoryAnimations() {
  if (prefersReducedMotion()) return;

  const desktop = window.matchMedia("(min-width: 1025px)").matches;

  const ctx = gsap.context(() => {
    /* --- Project phases rise + fade as their world scrolls in ---------- */
    gsap.utils.toArray(".world").forEach((world) => {
      const phases = world.querySelectorAll(".phase");
      if (phases.length) {
        gsap.from(phases, {
          y: 40,
          opacity: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: world,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        });
      }

      // Only the console panel gets scrubbed parallax (it has room to move,
      // unlike the narrative column which must never drift under the nav).
      // Desktop only — avoids scrubbed work on phones.
      const visual = world.querySelector(".world__visual");
      if (visual && desktop) {
        gsap.fromTo(
          visual,
          { y: 46 },
          {
            y: -46,
            ease: "none",
            scrollTrigger: { trigger: world, start: "top bottom", end: "bottom top", scrub: 1 },
          },
        );
      }
    });

    /* --- Milestones draw in along the path spine ---------------------- */
    gsap.set(".milestone", { opacity: 0, y: 30 });
    ScrollTrigger.batch(".milestone", {
      start: "top 88%",
      onEnter: (batch) => {
        batch.forEach((el) => el.classList.add("is-revealed")); // lights the dot
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.1,
          overwrite: true,
        });
      },
    });

    /* --- Monuments (arena) rise like they are being lit --------------- */
    ScrollTrigger.batch(".monument", {
      start: "top 85%",
      onEnter: (batch) =>
        gsap.from(batch, {
          y: 60,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.12,
          overwrite: true,
        }),
    });

    /* --- Satellites in the constellation pop in ----------------------- */
    ScrollTrigger.batch(".satellite", {
      start: "top 90%",
      onEnter: (batch) =>
        gsap.from(batch, {
          y: 40,
          opacity: 0,
          scale: 0.94,
          duration: 0.7,
          ease: "back.out(1.4)",
          stagger: 0.08,
          overwrite: true,
        }),
    });

    /* --- Research metrics count-panels lift in ------------------------ */
    ScrollTrigger.batch(".metric", {
      start: "top 88%",
      onEnter: (batch) =>
        gsap.from(batch, {
          y: 30,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.14,
          overwrite: true,
        }),
    });

    /* --- Instruments slide in from alternating sides ------------------ */
    gsap.utils.toArray(".instrument").forEach((el, i) => {
      gsap.from(el, {
        x: i % 2 === 0 ? -48 : 48,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none reverse" },
      });
    });

    /* --- Console panels lift + fade in as their world arrives ---------- */
    gsap.utils.toArray(".world__visual").forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 30,
        scale: 0.97,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 80%", toggleActions: "play none none reverse" },
      });
    });

    /* --- Secondary-system cards (constellation) pop in with a stagger -- */
    ScrollTrigger.batch(".satellite", {
      start: "top 90%",
      onEnter: (batch) =>
        gsap.from(batch, {
          y: 34,
          opacity: 0,
          scale: 0.96,
          duration: 0.7,
          ease: "back.out(1.3)",
          stagger: 0.07,
          overwrite: true,
        }),
    });

    /* --- Hero: the arrival stats + actions rise in sequence ----------- */
    const heroBits = gsap.utils.toArray(".arrival__acts, .arrival__stats .stat");
    if (heroBits.length) {
      gsap.from(heroBits, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.9,
      });
    }

    /* --- Contact links fan in on the final chapter -------------------- */
    ScrollTrigger.batch(".horizon__link", {
      start: "top 88%",
      onEnter: (batch) =>
        gsap.from(batch, { y: 26, opacity: 0, duration: 0.7, ease: "power2.out", stagger: 0.1, overwrite: true }),
    });

    /* --- Hero opening sequence: kicker → name → lede → role ------------- */
    const heroIntro = gsap.utils.toArray(
      ".arrival .kicker, .arrival__title .sl, .arrival__lede, .arrival__role",
    );
    if (heroIntro.length) {
      gsap.from(heroIntro, {
        y: 44,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.55,
        clearProps: "transform",
      });
    }

    /* --- Project world titles: ordinal → lines → caption ---------------- */
    gsap.utils.toArray(".world").forEach((world) => {
      const bits = world.querySelectorAll(
        ".world__ordinal, .world__title-line, .world__caption, .world__stack, .world__telemetry, .world__link",
      );
      if (!bits.length) return;
      gsap.from(bits, {
        y: 34,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.07,
        scrollTrigger: { trigger: world, start: "top 68%", toggleActions: "play none none reverse" },
      });
    });

    /* --- Technical-world nucleus assembles ------------------------------ */
    const core = document.querySelector(".techworld__core");
    if (core) {
      gsap.from(core, {
        scale: 0.7,
        opacity: 0,
        rotate: -24,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: core, start: "top 82%", toggleActions: "play none none reverse" },
      });
    }

    /* --- Origin records ledger: rows cascade ---------------------------- */
    ScrollTrigger.batch(".person__records .record", {
      start: "top 90%",
      onEnter: (batch) =>
        gsap.from(batch, {
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.09,
          overwrite: true,
        }),
    });

    /* --- Research pipeline steps + gauges draw through ------------------ */
    ScrollTrigger.batch(".pipeline__step", {
      start: "top 86%",
      onEnter: (batch) =>
        gsap.from(batch, {
          y: 36,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          overwrite: true,
        }),
    });

    /* --- Tech usage ledger rows slide ----------------------------------- */
    ScrollTrigger.batch(".usage__row", {
      start: "top 92%",
      onEnter: (batch) =>
        gsap.from(batch, {
          x: -30,
          opacity: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          overwrite: true,
        }),
    });
  });

  // GSAP recalculates once fonts settle so trigger positions are accurate.
  if (document.fonts?.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  return () => ctx.revert();
}
