/**
 * fx.js — Visual Effects Layer · YOGE.DEV
 *
 * A standard ES module (no bundler required). Works with:
 *   <script type="module" src="js/fx.js"></script>
 *
 * Single RAF loop merges cursor trail animation and accent color lerp.
 * No GSAP dependency — all effects here run independently.
 *
 * Requirements: 2.3, 7.2, 7.3, 8.2, 8.3, 8.5, 15.1
 */

/* ─── Shared mouse state ────────────────────────────────── */
let _mx = (typeof window !== 'undefined') ? window.innerWidth / 2 : 0;
let _my = (typeof window !== 'undefined') ? window.innerHeight / 2 : 0;

if (typeof document !== 'undefined') {
  document.addEventListener('mousemove', e => {
    _mx = e.clientX;
    _my = e.clientY;
  }, { passive: true });
}

/* ─── Accent color state (exported so initSectionColors can write to it) ─── */

/**
 * Live RGB triplet — lerped toward accentTarget each frame.
 * @type {[number, number, number]}
 */
const accentCurr = [102, 231, 242];

/**
 * Target RGB triplet — written by initSectionColors() on section enter.
 * Exported so fx consumers can update it directly.
 * @type {[number, number, number]}
 */
export const accentTarget = [102, 231, 242];

/* ════════════════════════════════════════════════════════
   SINGLE MASTER RAF — cursor trail + accent lerp merged
   No separate loops; one tick handles everything.
   Requirements: 7.2, 7.3, 8.2, 8.3, 8.5, 15.1
   ════════════════════════════════════════════════════════ */

const TRAIL_COUNT = 8;
const trailDots   = [];

/**
 * initMasterRAF()
 *
 * On non-coarse devices:
 *   - Creates 8 ghost trail dots (.ctrail) and appends them to document.body.
 *   - Each frame lerps each dot toward the previous dot (or mouse position),
 *     using speed = 0.40 - i * 0.028.
 *
 * Every frame (coarse + non-coarse):
 *   - Lerps accentCurr toward accentTarget (factor L = 0.03).
 *   - Terminates per-channel when |delta| ≤ 0.3.
 *   - Writes --ar, --ag, --ab to :root only when any channel changed.
 *
 * Requirements: 7.2, 7.3, 8.2, 8.3, 8.5, 15.1
 */
export function initMasterRAF() {
  const isCoarse = window.matchMedia('(pointer:coarse)').matches;
  const root     = document.documentElement;

  /* Build cursor trail dots (desktop / fine-pointer only) */
  if (!isCoarse) {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const sz = Math.max(2, 6 - i * 0.5);
      const d  = document.createElement('div');
      d.className = 'ctrail';
      d.style.cssText = [
        'position:fixed',
        'top:0',
        'left:0',
        'pointer-events:none',
        'z-index:99990',
        'border-radius:50%',
        'will-change:transform',
        `width:${sz}px`,
        `height:${sz}px`,
        'transform:translate(-500px,-500px)',
      ].join(';');
      frag.appendChild(d);
      trailDots.push({ el: d, x: -500, y: -500 });
    }
    document.body.appendChild(frag);
  }

  /* Single tick — handles both trail and accent lerp */
  (function tick() {
    /* ── Trail animation (fine-pointer only) ── */
    if (!isCoarse && trailDots.length) {
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const spd  = 0.40 - i * 0.028;
        const prev = i === 0 ? { x: _mx, y: _my } : trailDots[i - 1];
        trailDots[i].x += (prev.x - trailDots[i].x) * spd;
        trailDots[i].y += (prev.y - trailDots[i].y) * spd;

        /* Fade alpha from front (brightest) to back (dimmest) */
        const alpha = ((TRAIL_COUNT - i) / TRAIL_COUNT * 0.5).toFixed(2);
        const r     = Math.round(accentCurr[0]);
        const g     = Math.round(accentCurr[1]);
        const b     = Math.round(accentCurr[2]);
        trailDots[i].el.style.transform =
          `translate(${trailDots[i].x.toFixed(1)}px,${trailDots[i].y.toFixed(1)}px) translate(-50%,-50%)`;
        trailDots[i].el.style.background = `rgba(${r},${g},${b},${alpha})`;
      }
    }

    /* ── Accent color lerp ── */
    const L       = 0.03;
    let   changed = false;
    for (let i = 0; i < 3; i++) {
      const delta = accentTarget[i] - accentCurr[i];
      if (Math.abs(delta) > 0.3) {
        accentCurr[i] += delta * L;
        changed = true;
      }
    }
    if (changed) {
      root.style.setProperty('--ar', Math.round(accentCurr[0]));
      root.style.setProperty('--ag', Math.round(accentCurr[1]));
      root.style.setProperty('--ab', Math.round(accentCurr[2]));
    }

    requestAnimationFrame(tick);
  })();
}

/* ════════════════════════════════════════════════════════
   SECTION COLOR MAP — updates accentTarget on scroll
   Requirements: 7.1, 7.5
   ════════════════════════════════════════════════════════ */

/** @type {Record<string, [number, number, number]>} */
const SECTION_COLOR_MAP = {
  prologue:    [102, 231, 242],   // cyan
  origin:      [102, 231, 242],   // cyan
  journey:     [154, 140, 255],   // soft purple
  quests:      [168,  85, 247],   // vivid purple
  battles:     [ 16, 185, 129],   // emerald
  discovery:   [102, 231, 242],   // cyan
  credentials: [244, 199, 107],   // amber
  contact:     [102, 231, 242],   // cyan
};

/**
 * initSectionColors()
 *
 * Requires ScrollTrigger. Guard with typeof ScrollTrigger !== 'undefined' at call site.
 * Sets accentTarget when each .story-section[id] enters/re-enters the viewport.
 *
 * Requirements: 7.1, 7.5
 */
export function initSectionColors() {
  if (typeof ScrollTrigger === 'undefined') return;
  document.querySelectorAll('.story-section[id]').forEach(sec => {
    /* eslint-disable no-undef */
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 55%',
      onEnter:     () => {
        const color = SECTION_COLOR_MAP[sec.id];
        if (color) { accentTarget[0] = color[0]; accentTarget[1] = color[1]; accentTarget[2] = color[2]; }
      },
      onEnterBack: () => {
        const color = SECTION_COLOR_MAP[sec.id];
        if (color) { accentTarget[0] = color[0]; accentTarget[1] = color[1]; accentTarget[2] = color[2]; }
      },
    });
    /* eslint-enable no-undef */
  });
}

/* ════════════════════════════════════════════════════════
   SPOTLIGHT — CSS var only, no GSAP, no RAF
   Requirements: 9.1
   ════════════════════════════════════════════════════════ */

/**
 * initSpotlight()
 *
 * Wires mousemove on .hero-section to update --sx / --sy as percentages.
 * Adds/removes .has-spotlight on enter/leave.
 *
 * Requirements: 9.1
 */
export function initSpotlight() {
  const hero = document.querySelector('.hero-section');
  if (!hero) return;
  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--sx', ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%');
    hero.style.setProperty('--sy', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%');
    hero.classList.add('has-spotlight');
  }, { passive: true });
  hero.addEventListener('mouseleave', () => hero.classList.remove('has-spotlight'), { passive: true });
}

/* ════════════════════════════════════════════════════════
   MARQUEE STRIPS — CSS animation only, no per-frame JS
   Requirements: 9.2, 15.5
   ════════════════════════════════════════════════════════ */

const MARQUEE_STRIPS = [
  { after: '#origin',      text: 'SOFTWARE DEVELOPER · BACKEND ENGINEER · ML RESEARCHER' },
  { after: '#journey',     text: 'BUILDING THE FUTURE · ONE COMMIT AT A TIME' },
  { after: '#quests',      text: 'HACKER · BUILDER · RESEARCHER · INNOVATOR' },
  { after: '#battles',     text: 'AI · NLP · ML · JAVA · SPRING BOOT · PYTHON · MYSQL' },
  { after: '#discovery',   text: 'PUBLISHED · ORAL PRESENTATION · 99% ACCURACY · DISTILBERT' },
  { after: '#credentials', text: 'YOGE.DEV · PANIMALAR ENGINEERING · CHENNAI · INDIA' },
];

/**
 * Build the inner span content for a marquee strip.
 * Duplicate count: Math.max(30, Math.ceil(window.innerWidth / 40)) — handles 4K.
 * @param {string} text
 * @returns {string}  HTML string
 */
function buildMarqueeInner(text) {
  const copies = Math.max(30, Math.ceil(window.innerWidth / 40));
  return Array(copies).fill(`<span>${text}&nbsp;&nbsp;·&nbsp;&nbsp;</span>`).join('');
}

/**
 * initMarquee()
 *
 * Injects 6 marquee strips after target sections.
 * Adds a debounced resize listener to rebuild inner content on viewport change.
 * will-change:transform applied only to .marquee-inner elements.
 *
 * Requirements: 9.2, 15.5
 */
export function initMarquee() {
  const strips = [];

  MARQUEE_STRIPS.forEach(({ after, text }) => {
    const ref = document.querySelector(after);
    if (!ref) return;

    const strip = document.createElement('div');
    strip.className = 'marquee-strip';

    const inner = document.createElement('div');
    inner.className = 'marquee-inner';
    inner.style.willChange = 'transform';
    inner.innerHTML = buildMarqueeInner(text);

    strip.appendChild(inner);
    ref.insertAdjacentElement('afterend', strip);
    strips.push({ inner, text });
  });

  /* Debounced resize — rebuild inner content for new viewport width */
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      strips.forEach(({ inner, text }) => {
        inner.innerHTML = buildMarqueeInner(text);
      });
    }, 200);
  }, { passive: true });
}

/* ════════════════════════════════════════════════════════
   GLITCH DECODE — IntersectionObserver + hover
   Requirements: 9.3, 9.4, 9.5, 9.6
   ════════════════════════════════════════════════════════ */

const GLITCH_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * initGlitch()
 *
 * Requirements: 9.3, 9.4, 9.5, 9.6
 */
export function initGlitch() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      setTimeout(() => scramble(entry.target), 80); // eslint-disable-line no-use-before-define
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.section-eyebrow').forEach(el => {
    /* Store original text on first interaction */
    if (!el.getAttribute('data-orig')) {
      el.setAttribute('data-orig', el.textContent.trim());
    }
    obs.observe(el);
  });

  /* Hover wiring */
  function scramble(el) {
    const orig  = el.getAttribute('data-orig') || el.textContent.trim();
    el.setAttribute('data-orig', orig);
    let f       = 0;
    const total = orig.length * 2.8;
    let iv;

    iv = setInterval(() => {
      const revealed = Math.floor((f / total) * orig.length);
      el.textContent = orig.split('').map((c, i) => {
        if (c === ' ' || c === '·') return c;
        if (i < revealed) return c;
        return GLITCH_CHARSET[Math.floor(Math.random() * GLITCH_CHARSET.length)];
      }).join('');
      f++;
      if (f >= total) {
        el.textContent = orig;
        clearInterval(iv);
      }
    }, 28);

    return iv;
  }

  document.querySelectorAll('.section-eyebrow').forEach(el => {
    let activeIv = null;
    el.addEventListener('mouseenter', () => {
      if (activeIv) clearInterval(activeIv);
      activeIv = scramble(el);
    });
    el.addEventListener('mouseleave', () => {
      if (activeIv) {
        clearInterval(activeIv);
        activeIv = null;
        const orig = el.getAttribute('data-orig');
        if (orig) el.textContent = orig;
      }
    });
  });
}

/* ════════════════════════════════════════════════════════
   HERO PARTICLES — CSS keyframe, zero JS per frame
   Requirements: 9.7, 11.5
   ════════════════════════════════════════════════════════ */

/**
 * initParticles()
 *
 * Spawns 12 (mobile) or 25 (desktop) particles in #heroParticles.
 * Animated via CSS @keyframes pRise — no JS per frame.
 *
 * Requirements: 9.7, 11.5
 */
export function initParticles() {
  const wrap = document.getElementById('heroParticles');
  if (!wrap) return;

  const N    = window.innerWidth < 768 ? 12 : 25;
  const frag = document.createDocumentFragment();

  for (let i = 0; i < N; i++) {
    const s   = document.createElement('span');
    const sz  = (0.5 + Math.random() * 1.6).toFixed(1);
    const dur = (10  + Math.random() * 20).toFixed(1);
    const del = -(Math.random() * 22).toFixed(1);
    const xl  = (Math.random() * 100).toFixed(1);
    const col = Math.random() > 0.55
      ? 'var(--ar,102),var(--ag,231),var(--ab,242)'
      : '154,140,255';
    s.style.cssText = [
      'position:absolute',
      `left:${xl}%`,
      'bottom:0',
      `width:${sz}px`,
      `height:${sz}px`,
      'border-radius:50%',
      'pointer-events:none',
      `background:rgba(${col},${(0.12 + Math.random() * 0.4).toFixed(2)})`,
      `animation:pRise ${dur}s linear ${del}s infinite`,
    ].join(';');
    frag.appendChild(s);
  }

  wrap.appendChild(frag);
}

/* ════════════════════════════════════════════════════════
   CSS 3D TILT — VanillaTilt (desktop only)
   Requirements: 9.8, 11.1
   ════════════════════════════════════════════════════════ */

/**
 * initTilt()
 *
 * Requirements: 9.8, 11.1
 */
export function initTilt() {
  if (window.matchMedia('(pointer:coarse)').matches) return;
  if (typeof VanillaTilt === 'undefined') return; // eslint-disable-line no-undef

  /* eslint-disable no-undef */
  VanillaTilt.init(document.querySelectorAll('.origin-card'),   { max: 10, glare: false, gyroscope: false });
  VanillaTilt.init(document.querySelectorAll('.project-card'),  { max: 8,  glare: false, gyroscope: false });
  VanillaTilt.init(document.querySelectorAll('.battle-card'),   { max: 6,  glare: false, gyroscope: false });
  /* eslint-enable no-undef */
}

/* ════════════════════════════════════════════════════════
   MAGNETIC BUTTONS — pure style.transform (desktop only)
   Requirements: 9.9, 11.1
   ════════════════════════════════════════════════════════ */

/**
 * initMagnetic()
 *
 * Requirements: 9.9, 11.1
 */
export function initMagnetic() {
  if (window.matchMedia('(pointer:coarse)').matches) return;

  document.querySelectorAll('.btn--primary,.btn--accent').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width  / 2) * 0.25;
      const y = (e.clientY - r.top  - r.height / 2) * 0.25;
      btn.style.transform = `translate(${x}px,${y}px)`;
    }, { passive: true });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .65s cubic-bezier(.16,1,.3,1)';
      btn.style.transform  = '';
      setTimeout(() => { btn.style.transition = ''; }, 670);
    }, { passive: true });
  });
}

/* ════════════════════════════════════════════════════════
   CHAPTER FLASH — full-screen chapter overlay
   Requirements: (supports cinematic narrative)
   ════════════════════════════════════════════════════════ */

const CHAPTERS = [
  { id: 'origin',      n: '01', t: 'The Origin'    },
  { id: 'journey',     n: '02', t: 'The Journey'   },
  { id: 'quests',      n: '03', t: 'The Quests'    },
  { id: 'battles',     n: '04', t: 'The Battles'   },
  { id: 'discovery',   n: '05', t: 'The Discovery' },
  { id: 'credentials', n: '06', t: 'Credentials'   },
  { id: 'contact',     n: '07', t: 'Connect'       },
];

/**
 * initChapterFlash()
 *
 * Creates #chflash and wires ScrollTrigger (with IntersectionObserver fallback).
 */
export function initChapterFlash() {
  const flash = document.createElement('div');
  flash.id = 'chflash';
  flash.innerHTML = '<b class="cf-n"></b><span class="cf-t"></span>';
  document.body.appendChild(flash);

  const cfN = flash.querySelector('.cf-n');
  const cfT = flash.querySelector('.cf-t');

  let cd = false;
  const fire = (n, t) => {
    if (cd) return;
    cd = true;
    setTimeout(() => { cd = false; }, 1800);
    cfN.textContent = n;
    cfT.textContent = t;

    if (typeof gsap !== 'undefined') { // eslint-disable-line no-undef
      /* eslint-disable no-undef */
      gsap.timeline()
        .set(flash, { display: 'flex', opacity: 0 })
        .to(flash,  { opacity: 1, duration: 0.2, ease: 'power2.in' })
        .to(flash,  { opacity: 0, duration: 0.6, ease: 'power3.out', delay: 0.25 })
        .set(flash, { display: 'none' });
      /* eslint-enable no-undef */
    }
  };

  if (typeof ScrollTrigger !== 'undefined') { // eslint-disable-line no-undef
    CHAPTERS.forEach(({ id, n, t }) => {
      const sec = document.getElementById(id);
      if (!sec) return;
      /* eslint-disable no-undef */
      ScrollTrigger.create({
        trigger: sec, start: 'top 10%',
        onEnter:     () => fire(n, t),
        onEnterBack: () => fire(n, t),
      });
      /* eslint-enable no-undef */
    });
  } else {
    /* IntersectionObserver fallback */
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const ch = CHAPTERS.find(c => c.id === entry.target.id);
        if (ch) fire(ch.n, ch.t);
      });
    }, { threshold: 0.1 });

    CHAPTERS.forEach(({ id }) => {
      const sec = document.getElementById(id);
      if (sec) obs.observe(sec);
    });
  }
}

/* ════════════════════════════════════════════════════════
   FX BOOT ENTRY POINT
   Requirements: 2.3
   ════════════════════════════════════════════════════════ */

/**
 * boot()
 *
 * Calls all init functions in order. Guards ScrollTrigger-dependent
 * functions with typeof checks so the FX layer can run without GSAP.
 *
 * Requirements: 2.3
 */
export function boot() {
  initMasterRAF();

  if (typeof ScrollTrigger !== 'undefined') { // eslint-disable-line no-undef
    initSectionColors();
  }

  initSpotlight();
  initMarquee();
  initGlitch();
  initParticles();
  initTilt();
  initMagnetic();

  if (typeof ScrollTrigger !== 'undefined') { // eslint-disable-line no-undef
    initChapterFlash();
  }
}
