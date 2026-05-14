/*!
 * STORY.JS  ·  YOGE.DEV  ·  Cinematic Portfolio Engine
 * Pure GSAP + native scroll + IntersectionObserver
 * No Lenis · No pin · No filter blur · No canvas
 */
'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const mob = () => window.innerWidth < 768;
const tab = () => window.innerWidth < 1024;

/* ════════════════════════════════════════════════════════
   1. CURSOR
   ════════════════════════════════════════════════════════ */
function initCursor() {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    const dot  = $('.cursor__dot');
    const ring = $('.cursor__ring');
    if (!dot || !ring) return;
    let rx = -500, ry = -500, mx = -500, my = -500;
    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
        dot.style.opacity = ring.style.opacity = '1';
    }, { passive: true });
    document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; });
    document.addEventListener('mousedown',  () => ring.classList.add('is-click'));
    document.addEventListener('mouseup',    () => ring.classList.remove('is-click'));
    (function loop() {
        rx += (mx - rx) * 0.10; ry += (my - ry) * 0.10;
        ring.style.transform = `translate(${rx.toFixed(1)}px,${ry.toFixed(1)}px) translate(-50%,-50%)`;
        requestAnimationFrame(loop);
    })();
    $$('a,button,.btn,.origin-card,.project-card,.battle-card').forEach(el => {
        el.addEventListener('mouseenter', () => { dot.classList.add('is-hover'); ring.classList.add('is-hover'); }, { passive: true });
        el.addEventListener('mouseleave', () => { dot.classList.remove('is-hover'); ring.classList.remove('is-hover'); }, { passive: true });
    });
}

/* ════════════════════════════════════════════════════════
   2. LOADING
   ════════════════════════════════════════════════════════ */
function initLoading() {
    const screen = $('.loading-screen');
    if (!screen) return;
    const t0 = Date.now(), MIN = 1600;
    function dismiss() {
        if (screen.dataset.done) return;
        screen.dataset.done = '1';
        screen.classList.add('is-done');
        setTimeout(() => { screen.classList.add('is-hidden'); heroEntry(); }, 900);
    }
    window.addEventListener('load', () => setTimeout(dismiss, Math.max(0, MIN - (Date.now() - t0))));
    setTimeout(dismiss, 4000);
}

/* ════════════════════════════════════════════════════════
   3. HERO ENTRY
   ════════════════════════════════════════════════════════ */
function heroEntry() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo('.hero-image__mask', { clipPath:'inset(100% 0 0 0)' }, { clipPath:'inset(0% 0 0 0)', duration:1.2, ease:'power4.inOut' }, 0)
        .fromTo('.hero-image__img',    { scale:1.1  },        { scale:1,        duration:1.6 }, 0)
        .fromTo('.hero-image__border', { opacity:0  },        { opacity:.6,     duration:1.0 }, .5)
        .fromTo('.hero-image__glow',   { opacity:0  },        { opacity:1,      duration:1.2 }, .6)
        .fromTo('.hero-badge',         { opacity:0, y:16 },   { opacity:1, y:0, duration:.8  }, 1.0)
        .fromTo('.hero-kicker',        { opacity:0, x:-24 },  { opacity:1, x:0, duration:.8  }, .4)
        .fromTo('.hero-headline',      { opacity:0, y:30 },   { opacity:1, y:0, duration:.9  }, .55)
        .fromTo('.hero-tagline',       { opacity:0, y:20 },   { opacity:1, y:0, duration:.8  }, .85)
        .fromTo('.hero-metrics',       { opacity:0, y:18 },   { opacity:1, y:0, duration:.8  }, 1.0)
        .fromTo('.hero-cta',           { opacity:0, y:18 },   { opacity:1, y:0, duration:.8  }, 1.15)
        .fromTo('.hero-scroll-hint',   { opacity:0 },         { opacity:1,      duration:.8  }, 1.7);

    /* Counters */
    $$('[data-count]').forEach(el => {
        const end = +el.dataset.count, obj = { v:0 };
        tl.to(obj, { v:end, duration:2, ease:'power2.out',
            onUpdate() { el.textContent = Math.round(obj.v); } }, 1.0);
    });

    /* Hero parallax depth on scroll */
    if (!tab()) {
        gsap.to('.hero-image__frame', { yPercent:-14, ease:'none',
            scrollTrigger: { trigger:'.hero-section', start:'top top', end:'bottom top', scrub:true } });
        gsap.to('.hero-kicker, .hero-headline, .hero-tagline', { yPercent:-8, ease:'none',
            scrollTrigger: { trigger:'.hero-section', start:'top top', end:'bottom top', scrub:true } });
    }

    /* Scroll hint: fade out as soon as user scrolls, then hide completely */
    gsap.to('.hero-scroll-hint', { opacity:0, y:8, ease:'none',
        scrollTrigger: {
            trigger: '.hero-section',
            start: '8% top',
            end:   '20% top',
            scrub: true,
            onLeave: () => gsap.set('.hero-scroll-hint', { display:'none' })
        }
    });
}

/* ════════════════════════════════════════════════════════
   4. NAV
   ════════════════════════════════════════════════════════ */
function initNav() {
    const nav = $('.main-nav'), toggle = $('#menuToggle'), menu = $('#mobileMenu');
    const closeB = $('#mobileClose'), bd = $('.mobile-menu__backdrop');

    window.addEventListener('scroll', () => {
        nav?.classList.toggle('is-scrolled', window.scrollY > 50);
    }, { passive:true });

    /* Scroll progress: use window.scroll listener for pixel-perfect accuracy */
    function updateProgress() {
        const scrolled = window.scrollY;
        const total    = document.documentElement.scrollHeight - window.innerHeight;
        if (total <= 0) return;
        const pct = Math.min(100, (scrolled / total) * 100);
        const fill = document.querySelector('.scroll-progress__fill');
        if (fill) fill.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    /* Initial call after everything settles */
    setTimeout(updateProgress, 3200);

    const linkMap = {};
    $$('.nav-link[href^="#"]').forEach(l => { linkMap[l.getAttribute('href').slice(1)] = l; });
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            $$('.nav-link').forEach(l => l.classList.remove('is-active'));
            linkMap[e.target.id]?.classList.add('is-active');
        });
    }, { threshold:.35 });
    $$('.story-section[id]').forEach(s => obs.observe(s));

    const openMenu  = () => { menu?.classList.add('is-open');    toggle?.classList.add('is-open');    document.body.style.overflow='hidden'; };
    const closeMenu = () => { menu?.classList.remove('is-open'); toggle?.classList.remove('is-open'); document.body.style.overflow=''; };
    toggle?.addEventListener('click', () => menu?.classList.contains('is-open') ? closeMenu() : openMenu());
    closeB?.addEventListener('click', closeMenu);
    bd?.addEventListener('click', closeMenu);
    $$('.mobile-link').forEach(l => l.addEventListener('click', () => {
        const id = l.getAttribute('href'); closeMenu();
        setTimeout(() => $(id)?.scrollIntoView({ behavior:'smooth', block:'start' }), 300);
    }));
    $$('.nav-link[href^="#"]').forEach(l => l.addEventListener('click', e => {
        e.preventDefault(); $(l.getAttribute('href'))?.scrollIntoView({ behavior:'smooth', block:'start' });
    }));
    $('.nav-logo')?.addEventListener('click', e => { e.preventDefault(); window.scrollTo({ top:0, behavior:'smooth' }); });
    $('.top-button')?.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));
}

/* ════════════════════════════════════════════════════════
   6. CINEMATIC SCROLL SCENES
   Each section has its own choreographed timeline
   ════════════════════════════════════════════════════════ */
function initScrollScenes() {
    const pow  = 'power3.out';
    const expo = 'expo.out';
    const PO   = 'play none none none';

    /* ── Section headers: wipe + eyebrow decode ── */
    $$('.section-title').forEach(el =>
        gsap.fromTo(el, { clipPath:'inset(0 100% 0 0)', opacity:1 },
            { clipPath:'inset(0 0% 0 0)', duration:1.1, ease:'power4.inOut',
                scrollTrigger:{ trigger:el, start:'top 88%', toggleActions:PO } })
    );
    $$('.section-eyebrow').forEach(el =>
        gsap.fromTo(el, { opacity:0, y:14, letterSpacing:'14px' },
            { opacity:1, y:0, letterSpacing:'4px', duration:.9, ease:pow,
                scrollTrigger:{ trigger:el, start:'top 90%', toggleActions:PO } })
    );
    $$('.section-subtitle').forEach(el =>
        gsap.fromTo(el, { opacity:0, y:20 },
            { opacity:1, y:0, duration:.9, delay:.2, ease:pow,
                scrollTrigger:{ trigger:el, start:'top 90%', toggleActions:PO } })
    );

    /* ── ORIGIN ─── word-by-word narration reveal ── */
    $$('.narrative-block').forEach((block, bi) => {
        /* Reveal each block flying in from left — NO splitWords (breaks HTML tags) */
        gsap.fromTo(block, { opacity:0, x:-50 },
            { opacity:1, x:0, duration:.9, delay:bi*.08, ease:pow,
                scrollTrigger:{ trigger:block, start:'top 86%', toggleActions:PO } });
    });

    /* Origin cards — dramatic 3D throw-in */
    $$('.origin-card').forEach((card, i) =>
        gsap.fromTo(card,
            { opacity:0, y:70, rotateX:25, scale:.88, transformPerspective:1000 },
            { opacity:1, y:0, rotateX:0, scale:1, duration:.9, delay:i*.12, ease:'back.out(1.3)',
                scrollTrigger:{ trigger:'.origin-cards', start:'top 82%', toggleActions:PO } })
    );

    /* ── JOURNEY — timeline line draws itself ── */
    gsap.to('.timeline__progress', { height:'100%', ease:'none',
        scrollTrigger:{ trigger:'.timeline', start:'top 65%', end:'bottom 35%', scrub:1 } });
    $$('.timeline-entry').forEach((entry, i) => {
        const card   = $('.timeline-entry__card', entry);
        const marker = $('.timeline-entry__marker', entry);
        if (!card) return;
        const fromX = tab() ? 0 : (i%2===0 ? -65 : 65);
        gsap.fromTo(card,
            { opacity:0, x:fromX, y:tab()?50:0, scale:.94 },
            { opacity:1, x:0, y:0, scale:1, duration:.95, ease:pow,
                scrollTrigger:{ trigger:card, start:'top 87%', toggleActions:PO } });
        if (marker) gsap.fromTo(marker, { opacity:0, scale:0 },
            { opacity:1, scale:1, duration:.6, ease:'back.out(2)',
                scrollTrigger:{ trigger:card, start:'top 87%', toggleActions:PO } });
    });

    /* ── QUESTS — project hero zooms from depth ── */
    gsap.fromTo('.project-hero',
        { opacity:0, scale:.78, y:60, transformPerspective:1200 },
        { opacity:1, scale:1, y:0, duration:1.2, ease:expo,
            scrollTrigger:{ trigger:'.project-hero', start:'top 82%', toggleActions:PO } });
    /* Visual icon spins in */
    gsap.fromTo('.project-hero__icon',
        { opacity:0, scale:0, rotation:-90 },
        { opacity:1, scale:1, rotation:0, duration:1, ease:'back.out(1.6)', delay:.3,
            scrollTrigger:{ trigger:'.project-hero', start:'top 78%', toggleActions:PO } });
    /* Tech pills fly up one by one */
    gsap.fromTo('.tech-pill',
        { opacity:0, y:20, scale:.85 },
        { opacity:1, y:0, scale:1, stagger:.055, duration:.6, ease:pow,
            scrollTrigger:{ trigger:'.project-hero__tech', start:'top 84%', toggleActions:PO } });
    /* Project grid cards thrown onto screen */
    $$('.project-card').forEach((c, i) => {
        const angle = i%2===0 ? -6 : 6;
        gsap.fromTo(c,
            { opacity:0, y:80, rotation:angle, scale:.85, transformPerspective:900 },
            { opacity:1, y:0, rotation:0, scale:1, duration:1, delay:i*.14, ease:expo,
                scrollTrigger:{ trigger:'.project-grid', start:'top 83%', toggleActions:PO } });
    });

    /* ── BATTLES ── featured card slams in left, grid stacks from right ── */
    gsap.fromTo('.battle-featured',
        { opacity:0, x:-80, scale:.95 },
        { opacity:1, x:0, scale:1, duration:1.1, ease:expo,
            scrollTrigger:{ trigger:'.battles-section', start:'top 80%', toggleActions:PO } });
    $$('.battle-card').forEach((c, i) =>
        gsap.fromTo(c,
            { opacity:0, x:70, scale:.94 },
            { opacity:1, x:0, scale:1, duration:.85, delay:i*.13, ease:pow,
                scrollTrigger:{ trigger:'.battle-grid', start:'top 82%', toggleActions:PO } })
    );
    /* Badge chips scatter in */
    gsap.fromTo('.badge, .win-badge',
        { opacity:0, scale:0, y:10 },
        { opacity:1, scale:1, y:0, stagger:.04, duration:.5, ease:'back.out(2)',
            scrollTrigger:{ trigger:'.battle-featured', start:'top 78%', toggleActions:PO } });

    /* ── DISCOVERY ── paper emerges from below ── */
    gsap.fromTo('.research-paper',
        { opacity:0, y:80, scale:.96 },
        { opacity:1, y:0, scale:1, duration:1.2, ease:expo,
            scrollTrigger:{ trigger:'.research-paper', start:'top 82%', toggleActions:PO } });
    /* Each sub-block staggers in */
    ['.research-paper__venue','.abstract-block','.keywords-block',
        '.results-block','.authors-block','.project-link-block','.paper-actions-row','.flags-row']
        .forEach((sel, i) => {
            const el = $(sel); if (!el) return;
            gsap.fromTo(el, { opacity:0, y:30 },
                { opacity:1, y:0, duration:.75, delay:i*.07, ease:'power2.out',
                    scrollTrigger:{ trigger:'.research-paper', start:'top 72%', toggleActions:PO } });
        });
    /* Result cards pop individually */
    $$('.result-card').forEach((card, i) =>
        gsap.fromTo(card,
            { opacity:0, scale:.7, y:40, transformPerspective:800 },
            { opacity:1, scale:1, y:0, duration:.8, delay:i*.15, ease:'back.out(1.5)',
                scrollTrigger:{ trigger:'.result-cards', start:'top 83%', toggleActions:PO } })
    );
    /* Keyword chips scatter in */
    gsap.fromTo('.kw-tag',
        { opacity:0, scale:0.7, y:10 },
        { opacity:1, scale:1, y:0, stagger:.04, duration:.5, ease:'back.out(1.8)',
            scrollTrigger:{ trigger:'.keywords-block', start:'top 84%', toggleActions:PO } });
    /* Flags */
    gsap.fromTo('.flag',
        { opacity:0, x:-16 },
        { opacity:1, x:0, stagger:.05, duration:.5, ease:pow,
            scrollTrigger:{ trigger:'.flags-row', start:'top 85%', toggleActions:PO } });

    /* ── CREDENTIALS ── panels slide in from sides ── */
    /* Skills panel: wipe from left like a loading bar itself */
    gsap.fromTo('.skills-panel',
        { opacity:0, x:-80, scale:.96 },
        { opacity:1, x:0, scale:1, duration:1.1, ease:expo,
            scrollTrigger:{ trigger:'.credentials-section', start:'top 80%', toggleActions:PO } });

    /* Each skill group header slams in */
    $$('.skill-group__header').forEach((el,i) =>
        gsap.fromTo(el, { opacity:0, x:-30 },
            { opacity:1, x:0, duration:.7, delay:.3+i*.12, ease:pow,
                scrollTrigger:{ trigger:'.skills-panel', start:'top 78%', toggleActions:PO } })
    );

    /* Certs panel: drops from above */
    gsap.fromTo('.certs-panel',
        { opacity:0, y:-60, scale:.96 },
        { opacity:1, y:0, scale:1, duration:1.1, delay:.1, ease:expo,
            scrollTrigger:{ trigger:'.credentials-section', start:'top 80%', toggleActions:PO } });

    /* Each cert item: stagger from right with scale */
    $$('.cert-item').forEach((el, i) =>
        gsap.fromTo(el,
            { opacity:0, x:55, scale:.92, transformPerspective:600 },
            { opacity:1, x:0, scale:1, duration:.75, delay:i*.09, ease:'back.out(1.4)',
                scrollTrigger:{ trigger:'.certs-panel', start:'top 82%', toggleActions:PO } })
    );

    /* Panel titles dramatic reveal */
    gsap.fromTo('.skills-panel .panel-title',
        { opacity:0, y:20, clipPath:'inset(0 100% 0 0)' },
        { opacity:1, y:0, clipPath:'inset(0 0% 0 0)', duration:.9, ease:'power4.inOut',
            scrollTrigger:{ trigger:'.skills-panel', start:'top 82%', toggleActions:PO } });
    gsap.fromTo('.certs-panel .panel-title',
        { opacity:0, y:20, clipPath:'inset(0 100% 0 0)' },
        { opacity:1, y:0, clipPath:'inset(0 0% 0 0)', duration:.9, ease:'power4.inOut',
            scrollTrigger:{ trigger:'.certs-panel', start:'top 82%', toggleActions:PO } });

    /* ── CONTACT ── cards cascade up ── */
    $$('.contact-card').forEach((el, i) =>
        gsap.fromTo(el, { opacity:0, y:50, scale:.95 },
            { opacity:1, y:0, scale:1, duration:.85, delay:i*.14, ease:expo,
                scrollTrigger:{ trigger:'.contact-section', start:'top 80%', toggleActions:PO } })
    );

    /* ── Section orb parallax ── */
    if (!mob()) {
        $$('.section-bg__orb').forEach((o, i) =>
            gsap.to(o, { y: i%2===0 ? -55 : -35, ease:'none',
                scrollTrigger:{ trigger:o.closest('section'), start:'top bottom', end:'bottom top', scrub:2 } })
        );
    }
}

/* ════════════════════════════════════════════════════════
   7. RESULT CARDS — robust bar + counter animation
   ════════════════════════════════════════════════════════ */
function initResultCards() {
    $$('.result-card').forEach(card => {
        const fill  = card.querySelector('.result-card__fill');
        const numEl = card.querySelector('.result-card__number');
        if (!fill || !numEl) return;

        /* Read target width from inline style BEFORE touching element */
        const styleAttr = fill.getAttribute('style') || '';
        const m = styleAttr.match(/width:\s*([\d.]+)%/);
        const targetW = parseFloat(m?.[1] || '99');
        const targetN = parseFloat(
            numEl.dataset.count ||
            numEl.textContent.replace(/[^\d.]/g,'')
        ) || 99;
        const isDecimal = targetN % 1 !== 0;

        /* Store for fallback */
        fill.dataset.targetW = targetW;

        /* Clear any previous inline style, GSAP will own the width */
        fill.removeAttribute('style');

        let fired = false;
        const obs = new IntersectionObserver(entries => {
            if (!entries[0].isIntersecting || fired) return;
            fired = true;
            obs.disconnect();

            requestAnimationFrame(() => {
                /* gsap.fromTo guarantees start state and overrides CSS */
                gsap.fromTo(fill,
                    { width: '0%' },
                    { width: targetW + '%', duration: 1.8, ease: 'power3.out', delay: 0.15,
                        clearProps: 'none' }
                );
                const obj = { v: 0 };
                gsap.to(obj, { v: targetN, duration: 1.8, ease: 'power3.out',
                    onUpdate() {
                        numEl.textContent = isDecimal
                            ? obj.v.toFixed(2) : Math.round(obj.v);
                    }
                });
            });
        }, { threshold: 0.05, rootMargin: '0px 0px -5% 0px' });
        obs.observe(card);
    });
}

/* ════════════════════════════════════════════════════════
   8. SKILL BARS
   ════════════════════════════════════════════════════════ */
function initSkillBars() {
    $$('.skill-bar__fill').forEach(bar => {
        const w = bar.dataset.width || '80';
        bar.style.width = '0%';
        const o = new IntersectionObserver(entries => {
            if (!entries[0].isIntersecting) return;
            gsap.to(bar, { width: w + '%', duration:1.6, ease:'power3.out', delay:.1 });
            o.disconnect();
        }, { threshold:.3 });
        o.observe(bar);
    });
}

/* ════════════════════════════════════════════════════════
   9. MARQUEE STRIPS
   ════════════════════════════════════════════════════════ */
function initMarquee() {
    const DATA = [
        ['#origin',      'SOFTWARE DEVELOPER · BACKEND ENGINEER · ML RESEARCHER · '],
        ['#journey',     'BUILDING THE FUTURE · ONE COMMIT AT A TIME · '],
        ['#quests',      'HACKER · BUILDER · RESEARCHER · INNOVATOR · '],
        ['#battles',     'AI · NLP · ML · JAVA · SPRING BOOT · PYTHON · '],
        ['#discovery',   'PUBLISHED · ORAL PRESENTATION · 99% ACCURACY · '],
        ['#credentials', 'YOGE.DEV · PANIMALAR · CHENNAI · INDIA · '],
    ];
    DATA.forEach(([id, text]) => {
        const ref = $(id); if (!ref) return;
        const strip = document.createElement('div');
        strip.className = 'marquee-strip';
        const inner = document.createElement('div');
        inner.className = 'marquee-inner';
        inner.innerHTML = Array(6).fill(`<span>${text}</span>`).join('');
        strip.appendChild(inner); ref.insertAdjacentElement('afterend', strip);
    });
}

/* ════════════════════════════════════════════════════════
   10. CHAPTER FLASH
   ════════════════════════════════════════════════════════ */
function initChapterFlash() {
    const el = document.createElement('div');
    el.id = 'chflash';
    el.innerHTML = '<b class="cf-n"></b><span class="cf-t"></span>';
    document.body.appendChild(el);
    const CHAPTERS = [
        ['origin','01','The Origin'],['journey','02','The Journey'],
        ['quests','03','The Quests'],['battles','04','The Battles'],
        ['discovery','05','The Discovery'],['credentials','06','Credentials'],
        ['contact','07','Connect'],
    ];
    let cd = false;
    const fire = (n, t) => {
        if (cd) return; cd = true; setTimeout(() => { cd = false; }, 2000);
        el.querySelector('.cf-n').textContent = n;
        el.querySelector('.cf-t').textContent = t;
        gsap.timeline()
            .set(el, { display:'flex', opacity:0 })
            .to(el,  { opacity:1, duration:.2 })
            .to(el,  { opacity:0, duration:.55, delay:.22 })
            .set(el, { display:'none' });
    };
    CHAPTERS.forEach(([id, n, t]) => {
        const sec = document.getElementById(id); if (!sec) return;
        const o = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) fire(n, t);
        }, { threshold:.15 });
        o.observe(sec);
    });
}

/* ════════════════════════════════════════════════════════
   11. JOURNEY PROGRESS
   ════════════════════════════════════════════════════════ */
function initJourney() {
    const section = $('.journey-section'); if (!section) return;
    gsap.to('.timeline__progress', { height:'100%', ease:'none',
        scrollTrigger:{ trigger:'.timeline', start:'top 65%', end:'bottom 35%', scrub:1 } });
}

/* ════════════════════════════════════════════════════════
   12. GLITCH on eyebrows
   ════════════════════════════════════════════════════════ */
function initGlitch() {
    const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $$('.section-eyebrow').forEach(el => {
        el.addEventListener('mouseenter', () => {
            const orig = el.textContent; let f = 0;
            const iv = setInterval(() => {
                el.textContent = orig.split('').map((c, i) =>
                    i < Math.floor(f/2.5) ? c : c===' ' ? ' ' : CH[Math.random()*CH.length|0]
                ).join('');
                if (++f > orig.length*3) { el.textContent = orig; clearInterval(iv); }
            }, 32);
        }, { passive:true });
    });
}

/* ════════════════════════════════════════════════════════
   13. SPOTLIGHT on hero
   ════════════════════════════════════════════════════════ */
function initSpotlight() {
    const hero = $('.hero-section'); if (!hero || mob()) return;
    hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--sx', ((e.clientX-r.left)/r.width*100).toFixed(1)+'%');
        hero.style.setProperty('--sy', ((e.clientY-r.top)/r.height*100).toFixed(1)+'%');
    }, { passive:true });
}

/* ════════════════════════════════════════════════════════
   14. CARD TILT (VanillaTilt)
   ════════════════════════════════════════════════════════ */
function initTilt() {
    if (mob()) return;
    if (typeof VanillaTilt === 'undefined') return;

    /* Origin cards – subtle 3D tilt */
    VanillaTilt.init(document.querySelectorAll('.origin-card'), {
        max: 12,
        speed: 600,
        glare: true,
        'max-glare': 0.15,
        perspective: 900,
        scale: 1.03,
        gyroscope: false,
    });

    /* Project cards */
    VanillaTilt.init(document.querySelectorAll('.project-card'), {
        max: 10,
        speed: 500,
        glare: true,
        'max-glare': 0.12,
        perspective: 1000,
        scale: 1.025,
        gyroscope: false,
    });

    /* Battle cards */
    VanillaTilt.init(document.querySelectorAll('.battle-card'), {
        max: 8,
        speed: 500,
        glare: true,
        'max-glare': 0.1,
        perspective: 1000,
        scale: 1.02,
        gyroscope: false,
    });
}

/* ════════════════════════════════════════════════════════
   14b. TYPED.JS – Hero role typewriter
   ════════════════════════════════════════════════════════ */
function initTyped() {
    const el = document.getElementById('typed-role');
    if (!el || typeof Typed === 'undefined') return;
    new Typed(el, {
        strings: [
            'Software Developer',
            'ML & NLP Researcher',
            'Full Stack Engineer',
            'Spring Boot Architect',
            'Open Source Builder',
        ],
        typeSpeed: 52,
        backSpeed: 28,
        backDelay: 2200,
        loop: true,
        smartBackspace: true,
    });
}

/* ════════════════════════════════════════════════════════
   15. PARTICLES
   ════════════════════════════════════════════════════════ */
function initParticles() {
    const wrap = $('#heroParticles'); if (!wrap) return;
    const N = mob() ? 12 : 25;
    const f = document.createDocumentFragment();
    for (let i=0; i<N; i++) {
        const s = document.createElement('span');
        s.style.cssText = [
            `position:absolute`,
            `left:${(Math.random()*100).toFixed(1)}%`,
            `bottom:0`,
            `width:${(.5+Math.random()*1.4).toFixed(1)}px`,
            `height:${(.5+Math.random()*1.4).toFixed(1)}px`,
            `border-radius:50%`,
            `background:rgba(${Math.random()>.5?'102,231,242':'154,140,255'},${(.1+Math.random()*.4).toFixed(2)})`,
            `animation:pRise ${(10+Math.random()*20).toFixed(1)}s linear ${-(Math.random()*18).toFixed(1)}s infinite`,
            `will-change:transform`,
            `pointer-events:none`,
        ].join(';');
        f.appendChild(s);
    }
    wrap.appendChild(f);
}

/* ════════════════════════════════════════════════════════
   16. MODAL
   ════════════════════════════════════════════════════════ */
function initModal() {
    const ov = $('.modal-overlay'); if (!ov) return;
    const close = () => { ov.classList.remove('is-active'); document.body.style.overflow=''; };
    const open  = () => { ov.classList.add('is-active');    document.body.style.overflow='hidden'; };
    $('.modal-close-btn')?.addEventListener('click', close);
    ov.addEventListener('click', e => e.target===ov && close());
    document.addEventListener('keydown', e => e.key==='Escape' && close());
    $$('[data-modal-open]').forEach(b => b.addEventListener('click', open));
}

/* ════════════════════════════════════════════════════════
   17. MAGNETIC BUTTONS
   ════════════════════════════════════════════════════════ */
function initMagneticButtons() {
    if (mob()) return;
    $$('.btn--primary, .btn--ghost, .btn--accent').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const dx = (e.clientX - cx) * 0.28;
            const dy = (e.clientY - cy) * 0.28;
            gsap.to(btn, { x: dx, y: dy, duration: 0.35, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
        });
    });
}

/* ════════════════════════════════════════════════════════
   18. FLOATING HERO BADGE
   ════════════════════════════════════════════════════════ */
function initFloatingElements() {
    gsap.to('.hero-badge', {
        y: -8,
        duration: 2.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
    });

    /* Tech pill pop on scroll */
    gsap.utils.toArray('.tech-pill, .battle-card__tags span').forEach((pill, i) => {
        gsap.from(pill, {
            scale: 0,
            opacity: 0,
            duration: 0.5,
            ease: 'back.out(1.7)',
            scrollTrigger: {
                trigger: pill,
                start: 'top 92%',
            },
            delay: i * 0.04,
        });
    });

    /* Contact card mouse ripple */
    $$('.contact-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
            card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        }, { passive: true });
    });

    /* Narrative block stagger reveal */
    $$('.narrative-block').forEach((block, i) => {
        ScrollTrigger.create({
            trigger: block,
            start: 'top 88%',
            onEnter: () => {
                setTimeout(() => block.classList.add('is-visible'), i * 120);
            },
        });
    });
}

/* ════════════════════════════════════════════════════════
   19. STAGGERED CARD ENTRANCE (GSAP)
   ════════════════════════════════════════════════════════ */
function initCardEntrances() {
    /* Origin cards */
    gsap.from('.origin-card', {
        y: 60,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.14,
        scrollTrigger: {
            trigger: '.origin-cards',
            start: 'top 82%',
        },
    });

    /* Project cards */
    gsap.from('.project-card', {
        y: 50,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        stagger: 0.16,
        scrollTrigger: {
            trigger: '.project-grid',
            start: 'top 85%',
        },
    });

    /* Battle cards */
    gsap.from('.battle-card', {
        x: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.13,
        scrollTrigger: {
            trigger: '.battle-grid',
            start: 'top 85%',
        },
    });

    /* Cert items */
    gsap.from('.cert-item', {
        x: -30,
        opacity: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
            trigger: '.certs-list',
            start: 'top 88%',
        },
    });
}

/* ════════════════════════════════════════════════════════
   20. COUNTER SPARKLE on section enter
   ════════════════════════════════════════════════════════ */
function initCounterSparkle() {
    $$('.hero-metric__number').forEach(el => {
        el.addEventListener('animationend', () => {
            el.classList.add('sparkle-done');
        });
    });
}

/* ════════════════════════════════════════════════════════
   21. SCROLL-TRIGGERED SKILL BAR ANIMATION (enhanced)
   ════════════════════════════════════════════════════════ */
function initSkillBarGlow() {
    $$('.skill-bar__fill').forEach(fill => {
        const pct = fill.style.width || fill.dataset.width;
        fill.style.width = '0';
        ScrollTrigger.create({
            trigger: fill,
            start: 'top 90%',
            onEnter: () => {
                gsap.to(fill, {
                    width: pct,
                    duration: 1.6,
                    ease: 'power2.out',
                    onComplete: () => {
                        gsap.to(fill, {
                            boxShadow: '0 0 10px rgba(102,231,242,0.6)',
                            duration: 0.4,
                            yoyo: true,
                            repeat: 1,
                        });
                    },
                });
            },
        });
    });
}

/* ════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, TextPlugin);

    initCursor();
    initParticles();
    initLoading();
    initNav();
    initJourney();
    initScrollScenes();
    initResultCards();
    initSkillBars();
    initMarquee();
    initChapterFlash();
    initTilt();
    initTyped();
    initGlitch();
    initSpotlight();
    initModal();
    initMagneticButtons();
    initFloatingElements();
    initCardEntrances();
    initCounterSparkle();
    initSkillBarGlow();

    document.fonts.ready.then(() => ScrollTrigger.refresh());
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt=setTimeout(()=>ScrollTrigger.refresh(),300); }, { passive:true });

    /* Hard fallback at 3s */
    setTimeout(() => {
        document.querySelectorAll('section *').forEach(el => {
            try {
                if (getComputedStyle(el).opacity === '0' && el.offsetParent !== null) {
                    el.style.opacity='1'; el.style.transform='none'; el.style.clipPath='none';
                }
            } catch(e) {}
        });
    }, 3000);
});