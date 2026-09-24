/**
 * INTERACTIONS
 * ------------
 * Progressive-enhancement layer: reveals, count-ups, magnetic buttons,
 * the custom cursor, the technical-world link drawing, and the research
 * detector. Every one of these is optional — the story works without them.
 */

import { prefersReducedMotion } from "./utils.js";

const reduced = prefersReducedMotion();

/* ------------------------------------------------------------------ */
/* Storytelling text animations                                       */
/* Split-text headings, staggered ledes, and narrator sentences that  */
/* reveal word-by-word as each section enters — so every chapter       */
/* "speaks" itself as you arrive.                                      */
/* ------------------------------------------------------------------ */

/** Wraps each word of an element in mask + word spans, preserving <br>,
 *  <em> and <span> emphasis. Returns the element for chaining. */
function splitHeading(el) {
  if (el.dataset.splitDone) return el;

  // Build lines from the existing markup, respecting <br> as line breaks.
  const lines = [[]];
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "BR") {
      lines.push([]);
    } else {
      lines[lines.length - 1].push(node);
    }
  });

  el.innerHTML = "";
  let wordIndex = 0;

  lines.forEach((nodes) => {
    const line = document.createElement("span");
    line.className = "sl";

    nodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach((token) => {
          if (!token.trim()) {
            line.appendChild(document.createTextNode(token));
            return;
          }
          const w = document.createElement("span");
          w.className = "sw";
          w.style.setProperty("--sw-i", String(wordIndex++));
          w.textContent = token;
          line.appendChild(w);
        });
      } else {
        // Preserve emphasis wrappers (em / span) but still animate the word.
        const w = document.createElement("span");
        w.className = "sw";
        w.style.setProperty("--sw-i", String(wordIndex++));
        w.appendChild(node.cloneNode(true));
        line.appendChild(w);
      }
    });

    el.appendChild(line);
  });

  el.dataset.splitDone = "true";
  return el;
}

/** Splits a lede paragraph into fade-in lines by clause. */
function splitLede(el) {
  if (el.dataset.fadeDone) return el;
  const text = el.textContent.replace(/\s+/g, " ").trim();
  // Break into a few readable segments on sentence / clause boundaries.
  const parts = text.split(/(?<=[.:—])\s+/).filter(Boolean);
  const segments = parts.length > 1 ? parts : [text];
  el.innerHTML = segments
    .map((seg, i) => `<span class="fl" style="--fl-i:${i}">${seg}</span>`)
    .join(" ");
  el.dataset.fadeDone = "true";
  el.classList.add("is-fade-ready");
  return el;
}

/** Wraps narrator words so they type in one at a time. */
function prepareNarrator(el) {
  if (el.dataset.narrateDone) return el;
  const mark = el.querySelector(".narrator__mark");
  const text = Array.from(el.childNodes)
    .filter((n) => n !== mark)
    .map((n) => n.textContent)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  el.innerHTML = "";
  if (mark) el.appendChild(mark);
  const words = text.split(" ");
  words.forEach((word, i) => {
    const w = document.createElement("span");
    w.className = "nw";
    w.style.setProperty("--nw-i", String(i));
    w.textContent = word;
    el.appendChild(w);
    el.appendChild(document.createTextNode(" "));
  });
  // The caret should appear only once the last word has typed in.
  const finish = words.length * 42 + 220 + 460;
  el.style.setProperty("--caret-delay", `${finish}ms`);
  el.dataset.narrateDone = "true";
  return el;
}

/** Injects the oversized ghost numeral behind every chapter, read from the
 *  section's own data-index so it always matches the real chapter number. */
function injectNumerals() {
  document.querySelectorAll(".chapter[data-index]").forEach((section) => {
    if (section.querySelector(".chapter__numeral")) return;
    const numeral = document.createElement("span");
    numeral.className = "chapter__numeral";
    numeral.setAttribute("aria-hidden", "true");
    numeral.textContent = String(section.dataset.index).padStart(2, "0");
    section.prepend(numeral);
  });
}

/** Marks chapter heads revealed (so the kicker rule draws) as they enter. */
function initHeadReveal() {
  const heads = Array.from(document.querySelectorAll(".chapter__head"));
  const arrivalKicker = document.querySelector(".chapter--arrival .kicker");
  arrivalKicker?.classList.add("is-shown");

  if (reduced || !("IntersectionObserver" in window)) {
    heads.forEach((h) => h.classList.add("is-revealed"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-revealed");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
  );
  heads.forEach((h) => {
    const r = h.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.9 && r.bottom > 0) h.classList.add("is-revealed");
    else io.observe(h);
  });
}

export function initStoryText() {
  injectNumerals();
  initHeadReveal();

  const headings = Array.from(document.querySelectorAll(".chapter__title, .arrival__title, .horizon__title"));
  const ledes = Array.from(document.querySelectorAll(".chapter__lede, .arrival__lede"));
  const narrators = Array.from(document.querySelectorAll("[data-narrate]"));

  headings.forEach(splitHeading);
  ledes.forEach(splitLede);
  narrators.forEach(prepareNarrator);

  if (reduced || !("IntersectionObserver" in window)) {
    headings.forEach((el) => el.classList.add("is-revealed"));
    ledes.forEach((el) => el.classList.add("is-revealed"));
    narrators.forEach((el) => el.classList.add("is-narrated"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add(entry.target.matches("[data-narrate]") ? "is-narrated" : "is-revealed");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
  );

  [...headings, ...ledes, ...narrators].forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9 && rect.bottom > 0) {
      el.classList.add(el.matches("[data-narrate]") ? "is-narrated" : "is-revealed");
      return;
    }
    io.observe(el);
  });
}

/* ------------------------------------------------------------------ */
/* Reveal on scroll                                                   */
/* ------------------------------------------------------------------ */

export function initReveals() {
  // Elements NOT listed here (milestone, monument, satellite, metric, phase,
  // instrument, world__content, pipeline__step, usage__row) are animated by
  // GSAP in story-animations.js, so they must not also carry a CSS opacity:0
  // reveal or they would double up.
  const selector = [
    ".pillar",
    ".domain",
    ".mindset__step",
    ".chapter__head",
    ".detector",
    ".research__prose",
    ".research__authors",
    ".person__creed",
    ".techworld__usage",
    ".constellation",
    ".world__head",
  ].join(",");

  const targets = Array.from(document.querySelectorAll(selector));

  if (reduced || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-revealed"));
    document.querySelectorAll(".specimen__readout").forEach((el) => el.classList.add("is-open"));
    return;
  }

  const reveal = (el) => {
    el.classList.add("is-revealed");
    el.style.setProperty("--reveal-delay", `${el.dataset.revealDelay ?? 0}ms`);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
  );

  targets.forEach((el, i) => {
    el.setAttribute("data-reveal", "");
    el.dataset.revealDelay = String(Math.min(i % 6, 5) * 55);
    // Anything already on screen is revealed immediately, so the first paint
    // never flashes hidden content.
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92 && rect.bottom > 0) {
      reveal(el);
      return;
    }
    observer.observe(el);
  });
}

/* ------------------------------------------------------------------ */
/* Count-up numbers                                                   */
/* ------------------------------------------------------------------ */

export function initCounters() {
  const counters = document.querySelectorAll("[data-count-to]");
  if (!counters.length) return;

  const run = (el) => {
    const target = Number(el.dataset.countTo);
    const decimals = (el.dataset.countTo.split(".")[1] ?? "").length;
    if (reduced) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    const duration = 1500;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(run);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 },
  );
  counters.forEach((el) => observer.observe(el));
}

/* ------------------------------------------------------------------ */
/* Magnetic buttons                                                   */
/* ------------------------------------------------------------------ */

export function initMagnetic() {
  if (reduced) return;
  const els = document.querySelectorAll("[data-magnetic]");
  els.forEach((el) => {
    let raf = 0;
    const onMove = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        el.style.transform = `translate(${dx * 10}px, ${dy * 8}px)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = "";
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
  });
}

/* ------------------------------------------------------------------ */
/* Custom cursor (fine pointers only)                                 */
/* ------------------------------------------------------------------ */

export function initCursor() {
  // Only fine, hover-capable pointers get the custom cursor; touch devices
  // are handled by initTouch() instead.
  if (reduced || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    initTouch();
    return;
  }

  // Hiding the native cursor is scoped to a class so it is only ever removed
  // on devices that actually get the replacement — no "double cursor".
  document.documentElement.classList.add("has-custom-cursor");

  const cursor = document.createElement("div");
  cursor.className = "cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = `
    <span class="cursor__ring">
      <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" stroke-dasharray="119.4" stroke-dashoffset="119.4"></circle></svg>
    </span>
    <span class="cursor__dot"></span>
    <span class="cursor__label"></span>`;
  document.body.appendChild(cursor);

  const ring = cursor.querySelector(".cursor__ring");
  const label = cursor.querySelector(".cursor__label");
  const arc = cursor.querySelector(".cursor__ring svg circle");
  const ARC_LEN = 119.4;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx;
  let ry = my;
  let ready = false;

  // The dot + label sit in a single transform layer that we move via a CSS
  // variable, so a pointermove only touches one custom property (cheap) and
  // never triggers layout. The ring follows in the rAF loop.
  cursor.style.setProperty("--cx", `${mx}px`);
  cursor.style.setProperty("--cy", `${my}px`);

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType === "touch") return;
      mx = e.clientX;
      my = e.clientY;
      cursor.style.setProperty("--cx", `${mx}px`);
      cursor.style.setProperty("--cy", `${my}px`);
      if (!ready) {
        ready = true;
        cursor.classList.add("is-ready");
      }
    },
    { passive: true },
  );

  // Single rAF that only writes the ring transform when it has actually moved
  // beyond a sub-pixel threshold — when the pointer is still, we do no work.
  let rafId = 0;
  const loop = () => {
    const nx = rx + (mx - rx) * 0.2;
    const ny = ry + (my - ry) * 0.2;
    if (Math.abs(nx - rx) > 0.05 || Math.abs(ny - ry) > 0.05) {
      rx = nx;
      ry = ny;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    }
    rafId = requestAnimationFrame(loop);
  };
  rafId = requestAnimationFrame(loop);

  // Pause the ring loop while the tab is hidden.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(loop);
    }
  });

  document.addEventListener("pointerdown", () => cursor.classList.add("is-down"), { passive: true });
  document.addEventListener("pointerup", () => cursor.classList.remove("is-down"), { passive: true });

  // Context-aware state. We track the current interactive element and only
  // update classes when it actually changes, so the common case (moving within
  // the same element) does zero class work. Uses pointerover only (one handler,
  // bubbling) with a cheap closest() lookup.
  const VIEW_SEL = ".world, .satellite, .domain, [data-cursor-view]";
  const LINK_SEL = "a, button, [data-magnetic]";
  let mode = "";
  document.addEventListener(
    "pointerover",
    (e) => {
      const view = e.target.closest(VIEW_SEL);
      const link = view ? null : e.target.closest(LINK_SEL);
      const next = view ? "view" : link ? "hover" : "";
      if (next === mode) return; // no change → no DOM writes
      mode = next;
      cursor.classList.toggle("is-view", next === "view");
      cursor.classList.toggle("is-hover", next === "hover");
      if (view) label.textContent = view.dataset.cursorLabel || "Explore";
    },
    { passive: true },
  );

  // Scroll progress arc — throttled to one write per frame via rAF.
  let arcScheduled = false;
  const writeArc = () => {
    arcScheduled = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    arc.style.strokeDashoffset = String(ARC_LEN * (1 - p));
  };
  window.addEventListener(
    "scroll",
    () => {
      if (arcScheduled) return;
      arcScheduled = true;
      requestAnimationFrame(writeArc);
    },
    { passive: true },
  );
  writeArc();
}

/* ------------------------------------------------------------------ */
/* Touch interactions — ripples + tilt on cards                       */
/* ------------------------------------------------------------------ */

export function initTouch() {
  if (!window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

  // A soft ripple wherever the visitor taps, tinted with the live accent.
  if (!reduced) {
    window.addEventListener(
      "pointerdown",
      (e) => {
        if (e.pointerType !== "touch") return;
        const ripple = document.createElement("span");
        ripple.className = "touch-ripple";
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        document.body.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove());
      },
      { passive: true },
    );
  }

  // Tap-to-focus: cards lift and glow while pressed, so touch feels tactile.
  const cards = document.querySelectorAll(".pillar, .domain, .satellite, .instrument, .monument");
  cards.forEach((card) => {
    card.addEventListener(
      "pointerdown",
      () => card.classList.add("is-touched"),
      { passive: true },
    );
    const clear = () => card.classList.remove("is-touched");
    card.addEventListener("pointerup", clear, { passive: true });
    card.addEventListener("pointercancel", clear, { passive: true });
    card.addEventListener("pointerleave", clear, { passive: true });
  });
}

/* ------------------------------------------------------------------ */
/* Chapter 06 — draw the SVG links between nucleus and domains        */
/* ------------------------------------------------------------------ */

export function initTechnicalLinks() {
  const svg = document.getElementById("techworld-links");
  const world = document.getElementById("techworld");
  if (!svg || !world) return;

  const core = world.querySelector("[data-tech-core]");
  const domains = Array.from(world.querySelectorAll("[data-domain]"));
  if (!core || !domains.length) return;

  const draw = () => {
    if (window.innerWidth <= 1024) {
      svg.innerHTML = "";
      return;
    }
    const box = world.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);

    const coreBox = core.getBoundingClientRect();
    const cx = coreBox.left + coreBox.width / 2 - box.left;
    const cy = coreBox.top + coreBox.height / 2 - box.top;

    const paths = domains
      .map((domain) => {
        const d = domain.getBoundingClientRect();
        const dx = d.left + d.width / 2 - box.left;
        const dy = d.top + d.height / 2 - box.top;
        // Curved link so it reads as an orbital connection, not a straight line.
        const midX = (cx + dx) / 2;
        const midY = (cy + dy) / 2 - Math.abs(dx - cx) * 0.16;
        return `<path d="M ${cx} ${cy} Q ${midX} ${midY} ${dx} ${dy}" />`;
      })
      .join("");

    svg.innerHTML = paths;
    requestAnimationFrame(() => svg.querySelectorAll("path").forEach((p) => p.classList.add("is-drawn")));
  };

  draw();
  window.addEventListener("resize", draw);
  window.addEventListener("load", draw);
  // Redraw once fonts settle so the geometry is accurate.
  if (document.fonts?.ready) document.fonts.ready.then(draw);
}

/* ------------------------------------------------------------------ */
/* Chapter 03 — the research detector                                  */
/* ------------------------------------------------------------------ */

export function initDetector() {
  const button = document.getElementById("specimen-run");
  const readout = document.getElementById("specimen-readout");
  if (!button || !readout) return;

  const run = () => {
    button.classList.add("is-running");
    button.disabled = true;

    readout.classList.add("is-open");

    const gauges = [
      { key: "dbert", target: 99.4, display: (v) => `${v.toFixed(1)}%` },
      { key: "iso", target: 0.982, display: (v) => v.toFixed(3) },
    ];

    gauges.forEach((gauge, gi) => {
      const valueEl = readout.querySelector(`[data-gauge-value="${gauge.key}"]`);
      const fillEl = readout.querySelector(`[data-gauge-fill="${gauge.key}"]`);
      if (!valueEl || !fillEl) return;

      const duration = reduced ? 0 : 1100;
      const start = performance.now() + gi * 260;

      const tick = (now) => {
        const t = Math.max(0, Math.min((now - start) / duration, 1));
        const eased = 1 - Math.pow(1 - t, 3);
        const value = gauge.target * eased;
        valueEl.textContent = gauge.display(value);
        fillEl.style.width = `${value * (gauge.key === "iso" ? 100 : 1)}%`;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });

    setTimeout(
      () => {
        button.classList.remove("is-running");
        button.querySelector(".specimen__run-label").textContent = "Run again";
        button.disabled = false;
      },
      reduced ? 0 : 1600,
    );
  };

  button.addEventListener("click", run);

  // Also open the readout when the specimen scrolls into view.
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          setTimeout(run, 500);
          observer.disconnect();
        });
      },
      { threshold: 0.5 },
    );
    observer.observe(document.getElementById("specimen"));
  }
}

/* ------------------------------------------------------------------ */
/* Chapter 08 — project console panels animate their gauges in view   */
/* ------------------------------------------------------------------ */

export function initConsoles() {
  const consoles = document.querySelectorAll(".console");
  if (!consoles.length) return;

  if (reduced || !("IntersectionObserver" in window)) {
    consoles.forEach((c) => c.classList.add("is-live"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // Scan line should travel the panel's own height.
        el.style.setProperty("--scan-h", `${Math.round(el.offsetHeight - 4)}px`);
        el.classList.add("is-live");
        io.unobserve(el);
      });
    },
    { threshold: 0.35 },
  );
  consoles.forEach((c) => io.observe(c));
}

/* ------------------------------------------------------------------ */
/* Top bar condensation + scroll hint                                 */
/* ------------------------------------------------------------------ */

export function initChrome() {
  const topbar = document.getElementById("topbar");
  const hint = document.getElementById("scroll-hint");

  const onScroll = () => {
    const y = window.scrollY;
    topbar?.classList.toggle("is-condensed", y > 40);
    hint?.classList.toggle("is-hidden", y > 60);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Pointer parallax feeds the camera rig.
  window.addEventListener(
    "pointermove",
    (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      document.documentElement.style.setProperty("--px", String(nx));
      document.documentElement.style.setProperty("--py", String(ny));
    },
    { passive: true },
  );
}

/* ------------------------------------------------------------------ */
/* Boot curtain                                                       */
/* ------------------------------------------------------------------ */

export function dismissBoot() {
  const boot = document.getElementById("boot");
  const fill = document.getElementById("boot-bar-fill");
  if (!boot) return;

  if (fill) {
    fill.style.width = "35%";
    setTimeout(() => (fill.style.width = "100%"), 120);
  }
  setTimeout(() => boot.classList.add("is-done"), reduced ? 60 : 620);
}
