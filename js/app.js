/* ==========================================================================
   APP — everything that moves. The page scroll position becomes the camera's
   position along the 3D world; sections map to stretches of the flight.
   ========================================================================== */

import { createScene } from './scene.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const params = new URLSearchParams(location.search);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- Theme ---------- */
let themeT = root.dataset.theme === 'light' ? 1 : 0;
let theme = themeT;
const themeBtn = $('#theme');
const metaTheme = $('#meta-theme');
function syncThemeUI() {
  const light = themeT === 1;
  themeBtn.setAttribute('aria-pressed', String(light));
  themeBtn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  metaTheme.setAttribute('content', light ? '#F3F0E8' : '#07080D');
}
themeBtn.addEventListener('click', () => {
  const light = root.dataset.theme !== 'light';
  root.dataset.theme = light ? 'light' : 'dark';
  themeT = light ? 1 : 0;
  try { localStorage.setItem('ym-theme', light ? 'light' : 'dark'); } catch (e) { /* storage blocked */ }
  syncThemeUI();
});
syncThemeUI();

/* ---------- Colour worlds: each set piece has a colour; the page accent follows the camera ---------- */
const PAL_NIGHT = [[255, 138, 61], [94, 200, 255], [157, 123, 255], [255, 184, 56], [64, 242, 184], [255, 92, 158]];
const PAL_DAY = [[224, 86, 27], [10, 110, 158], [95, 60, 200], [176, 110, 0], [0, 128, 96], [200, 40, 110]];
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
function accentFor(uPos, th) {
  const pos = Math.max(uPos, 0) - 0.27;           /* the piece in view sits about 12 units ahead of the camera */
  const k0 = Math.floor(pos);
  const f = smoothstep(0.3, 0.7, pos - k0);
  const a = ((k0 % 6) + 6) % 6;
  const b = (((k0 + 1) % 6) + 6) % 6;
  const blend = (P) => [0, 1, 2].map((i) => lerp(P[a][i], P[b][i], f));
  const n = blend(PAL_NIGHT), d = blend(PAL_DAY);
  return [0, 1, 2].map((i) => lerp(n[i], d[i], th));
}
function applyAccent(c, th) {
  const [r, g, b] = c.map(Math.round);
  const t = th < 0.5 ? c.map((v) => Math.round(v + (255 - v) * 0.22)) : c.map((v) => Math.round(v * 0.82));
  root.style.setProperty('--accent', `rgb(${r},${g},${b})`);
  root.style.setProperty('--accent-t', `rgb(${t[0]},${t[1]},${t[2]})`);
  root.style.setProperty('--glow', `rgba(${r},${g},${b},0.22)`);
  root.style.setProperty('--hl', `rgba(${r},${g},${b},${th < 0.5 ? 0.3 : 0.22})`);
}

/* ---------- 3D scene ---------- */
const canvas = $('#gl');
let scene = null;
let quality = parseFloat(params.get('scale')) || (coarse ? 0.75 : 0.9);
const fixedQuality = params.has('scale');
if (params.get('field') === 'css') {
  root.classList.add('no-gl');
} else {
  try {
    scene = createScene(canvas);
  } catch (err) {
    console.warn('[ym] 3D scene unavailable; using the CSS backdrop.', err);
  }
  if (!scene) root.classList.add('no-gl');
}
canvas.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();
  scene = null;
  root.classList.add('no-gl');
});

function look() {
  const w = innerWidth;
  if (w >= 1000) return { px: 4.3, scale: 0.9, sx: 0, sy: 0 };
  if (w >= 700) return { px: 3.8, scale: 0.85, sx: 0, sy: 0.1 };
  return { px: 3.3, scale: 0.75, sx: 0, sy: 0.2 };
}
function sizeCanvas() {
  if (!scene) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);   /* render in device pixels, capped at 2x */
  scene.resize(Math.max(2, Math.round(innerWidth * dpr * quality)), Math.max(2, Math.round(innerHeight * dpr * quality)));
}

/* ---------- Sections → flight path ---------- */
const sections = $$('[data-u]').map((el) => {
  const [a, b] = el.dataset.u.split(',').map(parseFloat);
  return { el, a, b };
});
let layout = [];
function measure() {
  layout = sections.map((s) => {
    const r = s.el.getBoundingClientRect();
    return { top: r.top + scrollY, h: Math.max(1, r.height), a: s.a, b: s.b };
  });
}
function uAt(y) {
  const c = y + innerHeight * 0.5;
  for (const s of layout) {
    if (c < s.top + s.h) return lerp(s.a, s.b, clamp((c - s.top) / s.h));
  }
  return layout.length ? layout[layout.length - 1].b : 0;
}

/* ---------- Kinetic type: the hero name rises letter by letter ---------- */
function splitNode(node, state) {
  [...node.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      for (const ch of n.textContent) {
        const s = document.createElement('span');
        s.className = 'ch';
        s.style.setProperty('--i', String(state.i++));
        s.setAttribute('aria-hidden', 'true');
        s.textContent = ch;
        frag.appendChild(s);
      }
      n.replaceWith(frag);
    } else if (n.nodeType === 1) {
      splitNode(n, state);
    }
  });
}
$$('[data-split]').forEach((row, k) => splitNode(row, { i: k * 11 }));

/* ---------- Scrubbed statement: words light up as you read ---------- */
const stmt = $('#statement');
let words = [];
if (stmt) {
  const text = stmt.textContent.trim();
  stmt.textContent = '';
  const parts = text.split(/\s+/);
  parts.forEach((wd, i) => {
    const s = document.createElement('span');
    s.className = 'w';
    s.textContent = wd;
    stmt.appendChild(s);
    if (i < parts.length - 1) stmt.appendChild(document.createTextNode(' '));
  });
  words = $$('.w', stmt);
}
function updateStatement() {
  if (!words.length) return;
  const r = stmt.getBoundingClientRect();
  const prog = reduce ? 1 : clamp((innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.3));
  const n = words.length;
  for (let i = 0; i < n; i++) {
    const k = clamp(prog * (n + 6) - i, 0, 1);
    const o = (0.16 + 0.84 * k).toFixed(2);
    if (words[i]._o !== o) { words[i]._o = o; words[i].style.setProperty('--o', o); }
  }
}

/* ---------- Headings: every word rises in as its heading enters view ---------- */
function splitWords(node, state) {
  [...node.childNodes].forEach((n) => {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const outer = document.createElement('span');
        outer.className = 'wd';
        const inner = document.createElement('span');
        inner.className = 'wi';
        inner.style.setProperty('--i', String(state.i++));
        inner.textContent = part;
        outer.appendChild(inner);
        frag.appendChild(outer);
      });
      n.replaceWith(frag);
    } else if (n.nodeType === 1) {
      splitWords(n, state);
    }
  });
}
const headings = $$('.title, .giant--s, .proj-title, .proj-cap, .timeline h3, .pipe h3, .card h3');
headings.forEach((h) => { h.classList.add('wsplit'); splitWords(h, { i: 0 }); });

/* ---------- Reveals and counters ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
      if (e.target.classList.contains('card')) setTimeout(() => e.target.classList.add('settled'), 1800);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
$$('.reveal, [data-in], .wsplit').forEach((el) => io.observe(el));

function countUp(el) {
  const end = parseFloat(el.dataset.count);
  const dec = parseInt(el.dataset.dec || '0', 10);
  const suffix = el.dataset.suffix || '';
  const final = end.toFixed(dec) + suffix;
  if (reduce) { el.textContent = final; return; }
  const t0 = performance.now();
  const step = (n) => {
    const k = clamp((n - t0) / 1400);
    el.textContent = (end * (1 - Math.pow(1 - k, 4))).toFixed(dec) + suffix;
    if (k < 1) requestAnimationFrame(step); else el.textContent = final;
  };
  requestAnimationFrame(step);
  setTimeout(() => { el.textContent = final; }, 2600);   /* never leave a number half-counted */
}
const counters = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) { countUp(e.target); counters.unobserve(e.target); }
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach((el) => counters.observe(el));

/* ---------- Stacked project cards ---------- */
const cards = $$('.proj');
let stickyMode = false;
function checkSticky() { stickyMode = cards.length > 0 && getComputedStyle(cards[0]).position === 'sticky'; }
function updateCards() {
  if (!stickyMode) return;
  cards.forEach((c, i) => {
    let t = 0;
    const next = cards[i + 1];
    if (next) {
      const stick = innerHeight * 0.09 + (i + 1) * 26;
      t = clamp(1 - (next.getBoundingClientRect().top - stick) / (innerHeight * 0.6));
    }
    c.style.setProperty('--sc', (1 - 0.05 * t).toFixed(4));
    c.style.setProperty('--t', t.toFixed(3));
  });
}

/* ---------- Timeline rail ---------- */
const timeline = $('#timeline');
function updateTimeline() {
  if (!timeline) return;
  const r = timeline.getBoundingClientRect();
  timeline.style.setProperty('--draw', clamp((innerHeight * 0.65 - r.top) / r.height).toFixed(3));
}

/* ---------- Marquees ---------- */
const marquees = $$('.marquee').map((m) => {
  const track = $('.track', m);
  const set = [...track.children];
  set.forEach((n) => track.appendChild(n.cloneNode(true)));
  set.forEach((n) => track.appendChild(n.cloneNode(true)));
  return { m, track, dir: parseFloat(m.dataset.dir) || -1, pos: 0, W: 1 };
});
function measureMarquees() {
  marquees.forEach((q) => { q.W = Math.max(1, q.track.scrollWidth / 3); });
}
function updateMarquees(dt, vel) {
  const speed = (reduce ? 0 : 46) + Math.abs(vel) * 0.3;
  marquees.forEach((q) => {
    q.pos = (q.pos + speed * dt) % q.W;
    const x = q.dir < 0 ? -q.pos : q.pos - q.W;
    q.track.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
  });
}

/* ---------- Cursor, magnetic buttons, spotlight ---------- */
const cursor = $('#cursor');
const cursorLabel = $('#cursor-label');
let cx = 0, cy = 0, tx = 0, ty = 0;
if (fine) {
  root.classList.add('has-cursor');
  addEventListener('pointermove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const t = e.target.closest && e.target.closest('[data-cursor]');
    if (t) { cursorLabel.textContent = t.dataset.cursor; cursor.classList.add('has-label'); }
    else cursor.classList.remove('has-label');
  });
  $$('.mag').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate3d(${((e.clientX - r.left - r.width / 2) * 0.3).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1)}px, 0)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
  $$('.spot').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
      el.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 7).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((0.5 - (e.clientY - r.top) / r.height) * 5).toFixed(2) + 'deg');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });
}

/* ---------- Drag the hero sculpture ---------- */
const heroEl = $('#top');
let spin = 0, spinV = 0, dragging = false, dragX = 0;
if (heroEl && !reduce) {
  heroEl.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a, button')) return;
    dragging = true; dragX = e.clientX;
    try { heroEl.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });
  heroEl.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragX;
    dragX = e.clientX;
    spin += dx * 0.008;
    spinV = dx * 0.008 * 60;
  });
  const endDrag = () => { dragging = false; };
  heroEl.addEventListener('pointerup', endDrag);
  heroEl.addEventListener('pointercancel', endDrag);
}

/* ---------- Section rail ---------- */
const railEl = $('#rail');
const railIds = [['about', 'About'], ['research', 'Research'], ['evidence', 'Evidence'], ['path', 'Path'], ['work', 'Work'], ['systems', 'Systems'], ['stack', 'Stack'], ['credentials', 'Proof'], ['contact', 'Contact']];
let railTops = [], railOn = -2;
if (railEl) {
  railEl.innerHTML = railIds.map(([id, n], i) => `<a href="#${id}"><span>${n}</span><i>${String(i + 1).padStart(2, '0')}</i></a>`).join('');
}
function measureRail() {
  railTops = railIds.map(([id]) => { const el = document.getElementById(id); return el ? el.getBoundingClientRect().top + scrollY : 1e9; });
}
function updateRail(y) {
  if (!railEl) return;
  const c = y + innerHeight * 0.5;
  let on = -1;
  railTops.forEach((t, i) => { if (c >= t) on = i; });
  if (on !== railOn) {
    railOn = on;
    [...railEl.children].forEach((a, i) => a.classList.toggle('on', i === on));
  }
}

/* ---------- Parallax: large display elements drift a little slower than the page ---------- */
const parallaxEls = $$('[data-speed]');
const progressEl = $('#progress');
function updateParallax() {
  parallaxEls.forEach((el) => {
    const r = el.getBoundingClientRect();
    const c = r.top + r.height / 2 - innerHeight / 2;
    el.style.setProperty('--py', (-c * parseFloat(el.dataset.speed)).toFixed(1) + 'px');
  });
  if (progressEl) {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progressEl.style.setProperty('--p', clamp(scrollY / max).toFixed(4));
  }
}

/* ---------- Drag gallery ---------- */
const gallery = $('#gallery');
if (gallery) {
  let down = false, sx = 0, sl = 0;
  gallery.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch') return;
    down = true; sx = e.clientX; sl = gallery.scrollLeft;
    gallery.classList.add('drag');
    gallery.setPointerCapture(e.pointerId);
  });
  gallery.addEventListener('pointermove', (e) => { if (down) gallery.scrollLeft = sl - (e.clientX - sx); });
  const up = () => { down = false; gallery.classList.remove('drag'); };
  gallery.addEventListener('pointerup', up);
  gallery.addEventListener('pointercancel', up);
}

/* ---------- Menu (small screens) ---------- */
const nav = $('#nav');
const menuBtn = $('#menu');
function setMenu(open) {
  nav.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close the menu' : 'Open the menu');
}
menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

/* ---------- Clock ---------- */
const clockEl = $('#clock');
function tick() {
  try {
    clockEl.textContent = 'Chennai ' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  } catch (e) { clockEl.textContent = 'Chennai'; }
}
tick();
setInterval(tick, 30000);
$('#year').textContent = String(new Date().getFullYear());

/* ---------- Loader ---------- */
const loader = $('#loader');
const loaderCount = $('#loader-count');
const loaderBar = $('#loader-bar');
let loaderDone = false;
function finishLoader() {
  if (loaderDone) return;
  loaderDone = true;
  loader.classList.add('done');
  root.classList.add('ready');
}
function runLoader() {
  if (params.has('nopre') || reduce) { finishLoader(); return; }
  const t0 = performance.now();
  let loaded = false;
  Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true }))),
  ]).then(() => { loaded = true; });
  const step = (now) => {
    const el = now - t0;
    const e = 1 - Math.pow(1 - clamp(el / 1300), 3);
    loaderCount.textContent = String(Math.round(e * 100)).padStart(3, '0');
    loaderBar.style.transform = `scaleX(${e.toFixed(3)})`;
    if ((el >= 1300 && loaded) || el >= 3200) { finishLoader(); return; }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Governor: trade resolution for frame time; never the motion ---------- */
let govAcc = 0, govN = 0, govFast = 0;
function govern(dt) {
  if (fixedQuality) return;
  govAcc += dt; govN++;
  if (govN < 45) return;
  const avg = govAcc / govN;
  govAcc = 0; govN = 0;
  if (avg > 0.034 && quality > 0.6) {
    quality = Math.max(0.6, quality - 0.06);
    sizeCanvas(); govFast = 0;
  } else if (avg < 0.017) {
    govFast++;
    if (govFast >= 6 && quality < 1) { quality = Math.min(1, quality + 0.04); sizeCanvas(); govFast = 0; }
  } else {
    govFast = 0;
  }
}

/* ---------- Frame loop ---------- */
const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
if (fine && !reduce) {
  addEventListener('pointermove', (e) => {
    mouse.x = (e.clientX / Math.max(innerWidth, 1)) * 2 - 1;
    mouse.y = -((e.clientY / Math.max(innerHeight, 1)) * 2 - 1);
  }, { passive: true });
}

let u = 0, last = performance.now(), lastY = scrollY, vel = 0;
let lastDomY = -1, needsDom = true, frameN = 0;
let lastActivity = performance.now();
const touch = () => { lastActivity = performance.now(); };
addEventListener('scroll', touch, { passive: true });
addEventListener('pointermove', touch, { passive: true });
addEventListener('keydown', touch);

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
  last = now;
  const y = scrollY;
  vel += ((y - lastY) / dt - vel) * 0.1;
  lastY = y;

  u += (uAt(y) - u) * (reduce ? 1 : 1 - Math.exp(-dt * 4.2));
  theme += (themeT - theme) * (1 - Math.exp(-dt * 5));
  const km = 1 - Math.exp(-dt * 4);
  mouse.sx += (mouse.x - mouse.sx) * km;
  mouse.sy += (mouse.y - mouse.sy) * km;

  frameN++;
  if (!dragging && Math.abs(spinV) > 0.001) { spin += spinV * dt; spinV *= Math.exp(-dt * 2.2); }
  const acc = accentFor(u, theme);
  if ((frameN & 3) === 0) applyAccent(acc, theme);
  const idle = now - lastActivity > 1500 && Math.abs(uAt(y) - u) < 0.002 && Math.abs(theme - themeT) < 0.01;
  if (scene && !document.hidden && !(idle && (frameN & 1))) {
    const L = look();
    try {
      scene.draw({
        time: reduce ? 0 : now / 1000, p: u, theme,
        px: L.px, scale: L.scale, sx: L.sx, sy: L.sy,
        mx: mouse.sx, my: mouse.sy,
        spin, accent: [acc[0] / 255, acc[1] / 255, acc[2] / 255],
      });
      if (!idle) govern(dt);        /* idle frames are paced on purpose; don't let them look slow */
    } catch (err) {
      console.warn('[ym] draw failed; using the CSS backdrop.', err);
      scene = null;
      root.classList.add('no-gl');
    }
  }

  if (needsDom || Math.abs(y - lastDomY) > 0.5) {   /* these read layout: only when scroll or size changed */
    updateStatement();
    updateCards();
    updateTimeline();
    updateRail(y);
    updateParallax();
    lastDomY = y;
    needsDom = false;
  }
  updateMarquees(dt, vel);
  if (fine) {
    cx += (tx - cx) * (1 - Math.exp(-dt * 22));
    cy += (ty - cy) * (1 - Math.exp(-dt * 22));
    cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
  }
}

/* ---------- Boot ---------- */
function relayout() {
  measure();
  measureMarquees();
  checkSticky();
  measureRail();
  needsDom = true;
}
sizeCanvas();
relayout();
u = uAt(scrollY);

let resizeTimer = 0;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { sizeCanvas(); relayout(); }, 120);
});
if ('ResizeObserver' in window) new ResizeObserver(() => { measure(); }).observe(document.body);
if (document.fonts) document.fonts.ready.then(relayout);

/* ?debug exposes the flight state for the still-image renderer (a development tool, not used by visitors). */
if (params.has('debug')) {
  window.__ym = {
    state: () => {
      const uu = uAt(scrollY);
      return { u: uu, theme: themeT, look: look(), accent: accentFor(uu, themeT).map((v) => v / 255) };
    },
  };
}

runLoader();
requestAnimationFrame(frame);
