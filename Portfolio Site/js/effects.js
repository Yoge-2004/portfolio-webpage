/*!
 * EFFECTS.JS  —  Immersion Layer  ·  YOGE.DEV
 * SINGLE RAF loop · No canvas · No backdrop-filter spam
 * CPU budget: cursor trail + color lerp merged into one tick
 */
'use strict';

/* ─── Shared state ──────────────────────────────────────── */
let _mx = window.innerWidth / 2;
let _my = window.innerHeight / 2;
document.addEventListener('mousemove', e => {
    _mx = e.clientX; _my = e.clientY;
}, { passive: true });

/* ════════════════════════════════════════════════════════
   SINGLE MASTER RAF — cursor trail + accent lerp merged
   No separate loops, one tick handles everything
   ════════════════════════════════════════════════════════ */
const TRAIL_COUNT = 8; // was 14 — halved
const trailDots   = [];
const accentCurr  = [102, 231, 242];
let   accentTarget = [102, 231, 242];

function initMasterLoop() {
    const isCoarse = window.matchMedia('(pointer:coarse)').matches;

    /* Build trail dots */
    if (!isCoarse) {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < TRAIL_COUNT; i++) {
            const d = document.createElement('div');
            d.className = 'ctrail';
            d.style.cssText = `position:fixed;top:0;left:0;pointer-events:none;z-index:99990;
                border-radius:50%;will-change:transform;
                width:${Math.max(2, 6 - i * 0.5)}px;
                height:${Math.max(2, 6 - i * 0.5)}px;
                transform:translate(-500px,-500px);`;
            frag.appendChild(d);
            trailDots.push({ el: d, x: -500, y: -500 });
        }
        document.body.appendChild(frag);
    }

    const root  = document.documentElement;

    (function tick() {
        /* Trail — lerp each dot toward previous */
        if (!isCoarse && trailDots.length) {
            for (let i = 0; i < TRAIL_COUNT; i++) {
                const spd  = 0.40 - i * 0.028;
                const prev = i === 0 ? { x: _mx, y: _my } : trailDots[i - 1];
                trailDots[i].x += (prev.x - trailDots[i].x) * spd;
                trailDots[i].y += (prev.y - trailDots[i].y) * spd;
                const alpha = ((TRAIL_COUNT - i) / TRAIL_COUNT * 0.5).toFixed(2);
                const r = Math.round(accentCurr[0]);
                const g = Math.round(accentCurr[1]);
                const b = Math.round(accentCurr[2]);
                trailDots[i].el.style.cssText +=
                    `;transform:translate(${trailDots[i].x.toFixed(1)}px,${trailDots[i].y.toFixed(1)}px) translate(-50%,-50%);`
                    + `background:rgba(${r},${g},${b},${alpha});`;
            }
        }

        /* Accent color lerp — smooth section color transition */
        const L = 0.03;
        let changed = false;
        for (let i = 0; i < 3; i++) {
            const d = accentTarget[i] - accentCurr[i];
            if (Math.abs(d) > 0.3) { accentCurr[i] += d * L; changed = true; }
        }
        if (changed) {
            const rv = `${Math.round(accentCurr[0])},${Math.round(accentCurr[1])},${Math.round(accentCurr[2])}`;
            root.style.setProperty('--ar', Math.round(accentCurr[0]));
            root.style.setProperty('--ag', Math.round(accentCurr[1]));
            root.style.setProperty('--ab', Math.round(accentCurr[2]));
        }

        requestAnimationFrame(tick);
    })();
}

/* ════════════════════════════════════════════════════════
   SECTION COLOR MAP — changes accentTarget on scroll
   ════════════════════════════════════════════════════════ */
function initSectionColors() {
    const MAP = {
        prologue:    [102, 231, 242],
        origin:      [102, 231, 242],
        journey:     [154, 140, 255],
        quests:      [168,  85, 247],
        battles:     [ 16, 185, 129],
        discovery:   [102, 231, 242],
        credentials: [244, 199, 107],
        contact:     [102, 231, 242],
    };
    document.querySelectorAll('.story-section[id]').forEach(sec => {
        ScrollTrigger.create({
            trigger: sec, start: 'top 55%',
            onEnter:     () => { accentTarget = MAP[sec.id] || accentTarget; },
            onEnterBack: () => { accentTarget = MAP[sec.id] || accentTarget; },
        });
    });
}

/* ════════════════════════════════════════════════════════
   SPOTLIGHT — CSS var only, no GSAP, no RAF
   ════════════════════════════════════════════════════════ */
function initSpotlight() {
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
   MARQUEE STRIPS between sections — CSS animation only
   ════════════════════════════════════════════════════════ */
function initMarquee() {
    const STRIPS = [
        { after: '#origin',      text: 'SOFTWARE DEVELOPER · BACKEND ENGINEER · ML RESEARCHER' },
        { after: '#journey',     text: 'BUILDING THE FUTURE · ONE COMMIT AT A TIME' },
        { after: '#quests',      text: 'HACKER · BUILDER · RESEARCHER · INNOVATOR' },
        { after: '#battles',     text: 'AI · NLP · ML · JAVA · SPRING BOOT · PYTHON · MYSQL' },
        { after: '#discovery',   text: 'PUBLISHED · ORAL PRESENTATION · 99% ACCURACY · DISTILBERT' },
        { after: '#credentials', text: 'YOGE.DEV · PANIMALAR ENGINEERING · CHENNAI · INDIA' },
    ];
    STRIPS.forEach(({ after, text }) => {
        const ref = document.querySelector(after);
        if (!ref) return;
        const strip = document.createElement('div');
        strip.className = 'marquee-strip';
        const inner = document.createElement('div');
        inner.className = 'marquee-inner';
        /* Duplicate 25× so loop is seamless */
        inner.innerHTML = Array(25).fill(
            `<span>${text}&nbsp;&nbsp;·&nbsp;&nbsp;</span>`
        ).join('');
        strip.appendChild(inner);
        ref.insertAdjacentElement('afterend', strip);
    });
}

/* ════════════════════════════════════════════════════════
   CHAPTER FLASH — lightweight, NO backdrop-filter
   ════════════════════════════════════════════════════════ */
function initChapterFlash() {
    const flash = document.createElement('div');
    flash.id = 'chflash';
    flash.innerHTML = '<b class="cf-n"></b><span class="cf-t"></span>';
    document.body.appendChild(flash);

    const CHAPTERS = [
        { id: 'origin',      n: '01', t: 'The Origin'    },
        { id: 'journey',     n: '02', t: 'The Journey'   },
        { id: 'quests',      n: '03', t: 'The Quests'    },
        { id: 'battles',     n: '04', t: 'The Battles'   },
        { id: 'discovery',   n: '05', t: 'The Discovery' },
        { id: 'credentials', n: '06', t: 'Credentials'   },
        { id: 'contact',     n: '07', t: 'Connect'       },
    ];
    let cd = false;
    const fire = (n, t) => {
        if (cd) return; cd = true;
        setTimeout(() => { cd = false; }, 1800);
        flash.querySelector('.cf-n').textContent = n;
        flash.querySelector('.cf-t').textContent = t;
        gsap.timeline()
            .set(flash,  { display: 'flex', opacity: 0 })
            .to(flash,   { opacity: 1, duration: .2, ease: 'power2.in' })
            .to(flash,   { opacity: 0, duration: .6, ease: 'power3.out', delay: .25 })
            .set(flash,  { display: 'none' });
    };
    CHAPTERS.forEach(({ id, n, t }) => {
        const sec = document.getElementById(id);
        if (!sec) return;
        ScrollTrigger.create({ trigger: sec, start: 'top 10%',
            onEnter: () => fire(n, t), onEnterBack: () => fire(n, t) });
    });
}

/* ════════════════════════════════════════════════════════
   GLITCH DECODE on section eyebrows — IntersectionObserver
   ════════════════════════════════════════════════════════ */
function initGlitch() {
    const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const scramble = el => {
        const orig = el.textContent;
        let f = 0;
        const iv = setInterval(() => {
            el.textContent = orig.split('').map((c, i) =>
                i < Math.floor(f / 2) ? c
                    : c === ' ' ? ' '
                        : CH[Math.floor(Math.random() * CH.length)]
            ).join('');
            if (++f > orig.length * 2) { el.textContent = orig; clearInterval(iv); }
        }, 35);
    };
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            setTimeout(() => scramble(e.target), 80);
            obs.unobserve(e.target);
        });
    }, { threshold: .5 });
    document.querySelectorAll('.section-eyebrow').forEach(el => obs.observe(el));
}

/* ════════════════════════════════════════════════════════
   CSS PARTICLE INJECT into hero — keyframe only
   ════════════════════════════════════════════════════════ */
function initParticles() {
    const wrap = document.getElementById('heroParticles');
    if (!wrap) return;
    const N = window.innerWidth < 768 ? 14 : 28;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < N; i++) {
        const s   = document.createElement('span');
        const sz  = (.5 + Math.random() * 1.6).toFixed(1);
        const dur = (10 + Math.random() * 20).toFixed(1);
        const del = -(Math.random() * 22).toFixed(1);
        const xl  = (Math.random() * 100).toFixed(1);
        const col = Math.random() > .55 ? 'var(--ar,102),var(--ag,231),var(--ab,242)' : '154,140,255';
        s.style.cssText = `position:absolute;left:${xl}%;bottom:0;
            width:${sz}px;height:${sz}px;border-radius:50%;pointer-events:none;
            background:rgba(${col},${(.12+Math.random()*.4).toFixed(2)});
            animation:pRise ${dur}s linear ${del}s infinite;
            will-change:transform;`;
        frag.appendChild(s);
    }
    wrap.appendChild(frag);
}

/* ════════════════════════════════════════════════════════
   TYPEWRITER on loading subtitle
   ════════════════════════════════════════════════════════ */
function initTypewriter() {
    const el = document.querySelector('.loading-sub');
    if (!el) return;
    const phrases = ['Initializing...', 'Building Story', 'Loading Experience'];
    let pi = 0, ci = 0, del = false;
    const tick = () => {
        const p = phrases[pi];
        if (!del) { el.textContent = p.slice(0, ++ci); if (ci === p.length) { del = true; setTimeout(tick, 1200); return; } }
        else       { el.textContent = p.slice(0, --ci); if (!ci) { del = false; pi = (pi+1) % phrases.length; setTimeout(tick, 350); return; } }
        setTimeout(tick, del ? 38 : 72);
    };
    setTimeout(tick, 900);
}

/* ════════════════════════════════════════════════════════
   CSS 3D TILT — no GSAP, pure style.transform
   ════════════════════════════════════════════════════════ */
function initTilt() {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    const SEL = '.origin-card,.project-card,.battle-card,.cert-item,.contact-card';
    document.querySelectorAll(SEL).forEach(card => {
        card.addEventListener('mousemove', e => {
            const r  = card.getBoundingClientRect();
            const x  = ((e.clientX - r.left) / r.width  - .5) * 12;
            const y  = ((e.clientY - r.top)  / r.height - .5) * -12;
            card.style.transform = `perspective(700px) rotateY(${x}deg) rotateX(${y}deg) scale(1.025)`;
        }, { passive: true });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
            card.style.transform  = '';
            setTimeout(() => { card.style.transition = ''; }, 620);
        }, { passive: true });
    });
}

/* ════════════════════════════════════════════════════════
   MAGNETIC BUTTONS — pure style.transform
   ════════════════════════════════════════════════════════ */
function initMagnetic() {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    document.querySelectorAll('.btn--primary,.btn--accent').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            const x = (e.clientX - r.left - r.width  / 2) * .25;
            const y = (e.clientY - r.top  - r.height / 2) * .25;
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
   INIT
   ════════════════════════════════════════════════════════ */
function boot() {
    initMasterLoop();    /* single RAF for trail + color lerp */
    initSectionColors(); /* sets accentTarget on scroll */
    initSpotlight();
    initMarquee();
    initChapterFlash();
    initGlitch();
    initParticles();
    initTypewriter();
    initTilt();
    initMagnetic();
}

document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();