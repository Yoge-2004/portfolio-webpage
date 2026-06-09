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

    /* Scroll hint: fade out as soon as user scrolls, then hide completely.
       once:false explicitly overrides ScrollTrigger.defaults({ once:true })
       so onEnterBack fires when the user scrolls back to the top. */
    gsap.fromTo('.hero-scroll-hint', { opacity: 1, y: 0 }, { opacity:0, y:8, ease:'none',
        scrollTrigger: {
            trigger: '.hero-section',
            start: '5% top',
            end:   '18% top',
            scrub: true,
            once: false,
            onLeave: () => {
                document.querySelector('.hero-scroll-hint')?.classList.add('is-scroll-hidden');
            },
            onEnterBack: () => {
                document.querySelector('.hero-scroll-hint')?.classList.remove('is-scroll-hidden');
            }
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

    /* Scroll-position scrollspy — works regardless of section height.
       Picks the section whose top is closest to (but still above) the
       nav bottom (~100px). Updates on every scroll frame. */
    const sections = Array.from($$('.story-section[id]'));
    function updateScrollspy() {
        const scrollY = window.scrollY + 110;
        let current = sections[0];
        for (const sec of sections) {
            if (sec.offsetTop <= scrollY) current = sec;
        }
        if (current) {
            $$('.nav-link').forEach(l => l.classList.remove('is-active'));
            linkMap[current.id]?.classList.add('is-active');
        }
    }
    window.addEventListener('scroll', updateScrollspy, { passive: true });
    setTimeout(updateScrollspy, 400);

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
    if (tab()) {
        /* Journey timeline line draws itself on scroll even on mobile/tablet */
        gsap.to('.timeline__progress', { height:'100%', ease:'none',
            scrollTrigger:{ trigger:'.timeline', start:'top 65%', end:'bottom 35%', scrub:1 } });
        return;
    }

    const pow  = 'power3.out';
    const expo = 'expo.out';
    const PO   = 'play none none none';

    /* Global ScrollTrigger defaults — once:true ensures every animation
       fires exactly once even on fast scroll; no element stays at opacity:0 */
    ScrollTrigger.defaults({
        once: true,
        fastScrollEnd: true,
        preventOverlaps: true,
    });

    /* ── Section headers: wipe + eyebrow decode ── */
    $$('.section-title').forEach(el => {
        // If already in viewport (page refresh mid-scroll), show immediately
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            gsap.set(el, { clipPath:'inset(0 0% 0 0)', opacity:1 });
            return;
        }
        gsap.fromTo(el, { clipPath:'inset(0 100% 0 0)', opacity:1 },
            { clipPath:'inset(0 0% 0 0)', duration:1.1, ease:'power4.inOut',
                scrollTrigger:{ trigger:el, start:'top bottom', once:true } });
    });
    $$('.section-eyebrow').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            gsap.set(el, { opacity:1, y:0, letterSpacing:'4px' });
            return;
        }
        gsap.fromTo(el, { opacity:0, y:14, letterSpacing:'14px' },
            { opacity:1, y:0, letterSpacing:'4px', duration:.9, ease:pow,
                scrollTrigger:{ trigger:el, start:'top bottom', once:true } });
    });
    $$('.section-subtitle').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            gsap.set(el, { opacity:1, y:0 });
            return;
        }
        gsap.fromTo(el, { opacity:0, y:20 },
            { opacity:1, y:0, duration:.9, delay:.2, ease:pow,
                scrollTrigger:{ trigger:el, start:'top bottom', once:true } });
    });

    /* ── ORIGIN ─── word-by-word narration reveal ── */
    $$('.narrative-block').forEach((block, bi) => {
        /* Reveal each block flying in from left — NO splitWords (breaks HTML tags) */
        gsap.fromTo(block, { opacity:0, x:-50 },
            { opacity:1, x:0, duration:.9, delay:bi*.08, ease:pow,
                scrollTrigger:{ trigger:block, start:'top 95%', once:true } });
    });

    /* Origin cards — dramatic 3D throw-in */
    $$('.origin-card').forEach((card, i) =>
        gsap.fromTo(card,
            { opacity:0, y:70, rotateX:25, scale:.88, transformPerspective:1000 },
            { opacity:1, y:0, rotateX:0, scale:1, duration:.9, delay:i*.12, ease:'back.out(1.3)',
                scrollTrigger:{ trigger:'.origin-cards', start:'top 92%', once:true } })
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
                scrollTrigger:{ trigger:card, start:'top 95%', once:true } });
        if (marker) gsap.fromTo(marker, { opacity:0, scale:0 },
            { opacity:1, scale:1, duration:.6, ease:'back.out(2)',
                scrollTrigger:{ trigger:card, start:'top 95%', once:true } });
    });

    /* ── QUESTS — project hero zooms from depth ── */
    gsap.fromTo('.project-hero',
        { opacity:0, scale:.78, y:60, transformPerspective:1200 },
        { opacity:1, scale:1, y:0, duration:1.2, ease:expo,
            scrollTrigger:{ trigger:'.project-hero', start:'top 92%', once:true } });
    /* Visual icon spins in */
    gsap.fromTo('.project-hero__icon',
        { opacity:0, scale:0, rotation:-90 },
        { opacity:1, scale:1, rotation:0, duration:1, ease:'back.out(1.6)', delay:.3,
            scrollTrigger:{ trigger:'.project-hero', start:'top 92%', once:true } });
    /* Tech pills fly up one by one */
    gsap.fromTo('.tech-pill',
        { opacity:0, y:20, scale:.85 },
        { opacity:1, y:0, scale:1, stagger:.055, duration:.6, ease:pow,
            scrollTrigger:{ trigger:'.project-hero__tech', start:'top 92%', once:true } });
    /* Project grid cards thrown onto screen */
    $$('.project-card').forEach((c, i) => {
        const angle = i%2===0 ? -6 : 6;
        gsap.fromTo(c,
            { opacity:0, y:80, rotation:angle, scale:.85, transformPerspective:900 },
            { opacity:1, y:0, rotation:0, scale:1, duration:1, delay:i*.14, ease:expo,
                scrollTrigger:{ trigger:'.project-grid', start:'top 92%', once:true } });
    });

    /* ── BATTLES ── featured card slams in left, grid stacks from right ── */
    gsap.fromTo('.battle-featured',
        { opacity:0, x:-80, scale:.95 },
        { opacity:1, x:0, scale:1, duration:1.1, ease:expo,
            scrollTrigger:{ trigger:'.battles-section', start:'top 92%', once:true } });
    $$('.battle-card').forEach((c, i) =>
        gsap.fromTo(c,
            { opacity:0, x:70, scale:.94 },
            { opacity:1, x:0, scale:1, duration:.85, delay:i*.13, ease:pow,
                scrollTrigger:{ trigger:'.battle-grid', start:'top 92%', once:true } })
    );
    /* Badge chips scatter in */
    gsap.fromTo('.badge, .win-badge',
        { opacity:0, scale:0, y:10 },
        { opacity:1, scale:1, y:0, stagger:.04, duration:.5, ease:'back.out(2)',
            scrollTrigger:{ trigger:'.battle-featured', start:'top 92%', once:true } });

    /* ── DISCOVERY ── paper emerges from below ── */
    gsap.fromTo('.research-paper',
        { opacity:0, y:80, scale:.96 },
        { opacity:1, y:0, scale:1, duration:1.2, ease:expo,
            scrollTrigger:{ trigger:'.research-paper', start:'top 92%', once:true } });
    /* Each sub-block staggers in */
    ['.research-paper__venue','.abstract-block','.keywords-block',
        '.results-block','.authors-block','.project-link-block','.paper-actions-row','.flags-row']
        .forEach((sel, i) => {
            const el = $(sel); if (!el) return;
            gsap.fromTo(el, { opacity:0, y:30 },
                { opacity:1, y:0, duration:.75, delay:i*.07, ease:'power2.out',
                    scrollTrigger:{ trigger:'.research-paper', start:'top 90%', once:true } });
        });
    /* Result cards pop individually */
    $$('.result-card').forEach((card, i) =>
        gsap.fromTo(card,
            { opacity:0, scale:.7, y:40, transformPerspective:800 },
            { opacity:1, scale:1, y:0, duration:.8, delay:i*.15, ease:'back.out(1.5)',
                scrollTrigger:{ trigger:'.result-cards', start:'top 92%', once:true } })
    );
    /* Keyword chips scatter in */
    gsap.fromTo('.kw-tag',
        { opacity:0, scale:0.7, y:10 },
        { opacity:1, scale:1, y:0, stagger:.04, duration:.5, ease:'back.out(1.8)',
            scrollTrigger:{ trigger:'.keywords-block', start:'top 92%', once:true } });
    /* Flags */
    gsap.fromTo('.flag',
        { opacity:0, x:-16 },
        { opacity:1, x:0, stagger:.05, duration:.5, ease:pow,
            scrollTrigger:{ trigger:'.flags-row', start:'top 92%', once:true } });

    /* ── CREDENTIALS ── panels slide in from sides ── */
    /* Skills panel: wipe from left like a loading bar itself */
    gsap.fromTo('.skills-panel',
        { opacity:0, x:-80, scale:.96 },
        { opacity:1, x:0, scale:1, duration:1.1, ease:expo,
            scrollTrigger:{ trigger:'.credentials-section', start:'top 92%', once:true } });

    /* Each skill group header slams in */
    $$('.skill-group__header').forEach((el,i) =>
        gsap.fromTo(el, { opacity:0, x:-30 },
            { opacity:1, x:0, duration:.7, delay:.3+i*.12, ease:pow,
                scrollTrigger:{ trigger:'.skills-panel', start:'top 92%', once:true } })
    );

    /* Certs panel: drops from above */
    gsap.fromTo('.certs-panel',
        { opacity:0, y:-60, scale:.96 },
        { opacity:1, y:0, scale:1, duration:1.1, delay:.1, ease:expo,
            scrollTrigger:{ trigger:'.credentials-section', start:'top 92%', once:true } });

    /* Each cert item: stagger from right with scale */
    $$('.cert-item').forEach((el, i) =>
        gsap.fromTo(el,
            { opacity:0, x:55, scale:.92, transformPerspective:600 },
            { opacity:1, x:0, scale:1, duration:.75, delay:i*.09, ease:'back.out(1.4)',
                scrollTrigger:{ trigger:'.certs-panel', start:'top 92%', once:true } })
    );

    /* Panel titles dramatic reveal */
    gsap.fromTo('.skills-panel .panel-title',
        { opacity:0, y:20, clipPath:'inset(0 100% 0 0)' },
        { opacity:1, y:0, clipPath:'inset(0 0% 0 0)', duration:.9, ease:'power4.inOut',
            scrollTrigger:{ trigger:'.skills-panel', start:'top 92%', once:true } });
    gsap.fromTo('.certs-panel .panel-title',
        { opacity:0, y:20, clipPath:'inset(0 100% 0 0)' },
        { opacity:1, y:0, clipPath:'inset(0 0% 0 0)', duration:.9, ease:'power4.inOut',
            scrollTrigger:{ trigger:'.certs-panel', start:'top 92%', once:true } });

    /* ── CONTACT ── cards cascade up ── */
    $$('.contact-card').forEach((el, i) =>
        gsap.fromTo(el, { opacity:0, y:50, scale:.95 },
            { opacity:1, y:0, scale:1, duration:.85, delay:i*.14, ease:expo,
                scrollTrigger:{ trigger:'.contact-section', start:'top 92%', once:true } })
    );

    /* ── Section orb parallax ── */
    if (!mob()) {
        $$('.section-bg__orb').forEach((o, i) =>
            gsap.to(o, { y: i%2===0 ? -55 : -35, ease:'none',
                scrollTrigger:{ trigger:o.closest('section'), start:'top bottom', end:'bottom top', scrub:2 } })
        );
        
        /* Desktop/4K subtle card parallax for fluid motion */
        $$('.project-card, .battle-card, .origin-card').forEach((card, i) => {
            gsap.to(card, { 
                yPercent: i % 2 === 0 ? -4 : -8, 
                ease: 'none',
                scrollTrigger: { 
                    trigger: card.closest('.story-section'), 
                    start: 'top bottom', 
                    end: 'bottom top', 
                    scrub: 1.5 
                } 
            });
        });
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
        strip.appendChild(inner); ref.insertAdjacentElement('afterend', strip);

        const buildMarquee = () => {
            /* Dynamically duplicate to ensure infinite loop on 4K/ultra-wide screens */
            const reps = Math.max(30, Math.ceil(window.innerWidth / 40));
            inner.innerHTML = Array(reps).fill(`<span>${text}</span>`).join('');
        };
        buildMarquee();
        let rt;
        window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(buildMarquee, 300); }, { passive: true });
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
        if (cd) return; cd = true; setTimeout(() => { cd = false; }, 1000);
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
        }, { threshold: 0.05, rootMargin: '-5% 0px -5% 0px' });
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
    const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    $$('.section-eyebrow').forEach(el => {
        let iv = null; // guard: only one interval per element at a time
        const orig = el.getAttribute('data-orig') || el.textContent.trim();
        el.setAttribute('data-orig', orig); // store original once

        el.addEventListener('mouseenter', () => {
            if (iv) { clearInterval(iv); iv = null; } // kill any running scramble
            let f = 0;
            const total = orig.length * 2.8; // total frames to complete
            iv = setInterval(() => {
                const revealed = Math.floor((f / total) * orig.length);
                el.textContent = orig.split('').map((c, i) => {
                    if (c === ' ' || c === '·') return c; // preserve spaces and dots
                    if (i < revealed) return c;           // revealed chars stay
                    return CH[Math.random() * CH.length | 0]; // scramble rest
                }).join('');
                f++;
                if (f >= total) {
                    el.textContent = orig; // guaranteed full restoration
                    clearInterval(iv);
                    iv = null;
                }
            }, 28);
        }, { passive: true });

        el.addEventListener('mouseleave', () => {
            // On leave, immediately restore if scramble is still running
            if (iv) {
                clearInterval(iv);
                iv = null;
                el.textContent = orig;
            }
        }, { passive: true });
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
        max: 10,
        speed: 600,
        glare: false,
        perspective: 900,
        scale: 1.03,
        gyroscope: false,
    });

    /* Project cards */
    VanillaTilt.init(document.querySelectorAll('.project-card'), {
        max: 8,
        speed: 500,
        glare: false,
        perspective: 1000,
        scale: 1.025,
        gyroscope: false,
    });

    /* Battle cards */
    VanillaTilt.init(document.querySelectorAll('.battle-card'), {
        max: 6,
        speed: 500,
        glare: false,
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
            'ML &amp; NLP Researcher',   /* &amp; avoids HTML entity parse issues */
            'Full Stack Engineer',
            'Spring Boot Architect',
            'Open Source Builder',
        ],
        typeSpeed: 42,        /* slightly faster — less wait feeling */
        backSpeed: 32,        /* slightly faster backspace */
        backDelay: 1800,      /* pause before backspacing */
        startDelay: 600,      /* wait for hero entry animation */
        loop: true,
        smartBackspace: false, /* disabled — causes abrupt show/hide on shared prefixes */
        showCursor: true,
        cursorChar: '|',
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
    /* Hero badge float: use CSS animation (not GSAP) because the badge
       uses transform:translateX(-50%) for centering. GSAP's gsap.to() with y
       rewrites the whole transform property, clobbering translateX(-50%) and
       causing horizontal jitter. CSS @keyframes stacks on top of the inline
       transform cleanly via the CSS animation-fill-mode. */
    const badge = document.querySelector('.hero-badge');
    if (badge) badge.classList.add('is-floating');

    /* Contact card mouse ripple */
    $$('.contact-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
            card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
        }, { passive: true });
    });

    /* Narrative block stagger reveal (only adds a class, never sets opacity:0) */
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
   19. MOBILE/TABLET ANIMATION ENGINE
   IntersectionObserver adds .mob-visible when elements enter
   viewport — triggers CSS transitions defined in animations.css.
   Only runs on ≤1024px where GSAP scroll-scrub is less impactful.
   ════════════════════════════════════════════════════════ */
function initMobileAnimations() {
    if (window.innerWidth >= 1024) return; /* matches tab() = innerWidth < 1024 */

    const SELECTORS = [
        '.origin-card', '.project-card', '.battle-card', '.battle-featured',
        '.cert-item', '.result-card', '.timeline-entry__card',
        '.timeline-entry__marker', '.contact-card', '.research-paper',
        '.narrative-block', '.section-eyebrow', '.section-title',
        '.section-subtitle',
    ];

    /* SAFE two-phase approach:
       1. Add .mob-entering on elements BELOW the fold (invisible at load)
          This hides them via CSS opacity:0
       2. IO adds .mob-visible when element enters viewport → CSS animates in
       Elements already visible at load get NEITHER class → always visible */
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const siblings = [...(el.parentElement?.children || [])];
            const delay = Math.min(siblings.indexOf(el) * 80, 400);
            setTimeout(() => el.classList.add('mob-visible'), delay);
            io.unobserve(el);
        });
    }, { threshold: 0.05, rootMargin: '0px 0px -10px 0px' });

    SELECTORS.forEach(sel => {
        $$(sel).forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top >= window.innerHeight - 40) {
                // Below fold: mark as entering (starts hidden) then observe
                el.classList.add('mob-entering');
                io.observe(el);
            }
            // Already in view: no class added → naturally visible
        });
    });

    /* Skill bars: animate width on scroll — always read data-width, never
       fill.style.width (which initSkillBars has already set to '0%') */
    $$('.skill-bar__fill').forEach(fill => {
        const tw = fill.dataset.width ? fill.dataset.width + '%' : '80%';
        fill.style.setProperty('--target-width', tw);
        const rect = fill.getBoundingClientRect();
        if (rect.top >= window.innerHeight) {
            fill.style.width = '0';
            const sio = new IntersectionObserver(([entry]) => {
                if (!entry.isIntersecting) return;
                setTimeout(() => {
                    fill.style.transition = 'width 1.2s cubic-bezier(0.16,1,0.3,1)';
                    fill.style.width = tw;
                }, 200);
                sio.unobserve(fill);
            }, { threshold: 0.1 });
            sio.observe(fill);
        }
    });

    setTimeout(() => document.body.classList.add('page-loaded'), 800);
}

/* ════════════════════════════════════════════════════════
   20. TOUCH & MOBILE INTERACTIONS
   ════════════════════════════════════════════════════════ */
function initTouchInteractions() {
    if (!window.matchMedia('(pointer:coarse)').matches) return;
    
    /* Tap feedback / Ripple for buttons and cards */
    $$('.btn, .origin-card, .project-card, .battle-card, .contact-card').forEach(el => {
        el.addEventListener('touchstart', () => {
            gsap.to(el, { scale: 0.95, duration: 0.15, ease: 'power2.out', overwrite: 'auto' });
        }, { passive: true });
        const reset = () => gsap.to(el, { scale: 1, duration: 0.4, ease: 'power2.out', overwrite: 'auto', clearProps: 'scale' });
        el.addEventListener('touchend', reset, { passive: true });
        el.addEventListener('touchcancel', reset, { passive: true });
    });

    /* Swipe hint on hero section */
    const hero = $('.hero-section');
    if (hero) {
        const hint = document.createElement('div');
        hint.className = 'mobile-swipe-hint';
        hint.innerHTML = '<span>Swipe up to explore</span><i class="fas fa-chevron-up"></i>';
        hint.style.cssText = 'position:absolute;bottom:15%;left:50%;transform:translateX(-50%);opacity:0;color:rgba(255,255,255,0.7);font-size:0.85rem;display:flex;flex-direction:column;align-items:center;gap:6px;pointer-events:none;z-index:20;';
        hero.appendChild(hint);
        
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1, paused: true });
        tl.fromTo(hint, { y: 0, opacity: 0 }, { y: -15, opacity: 1, duration: 0.8, ease: 'power2.out' })
          .to(hint, { y: -30, opacity: 0, duration: 0.8, ease: 'power2.in' });

        let started = false;
        setTimeout(() => {
            if (window.scrollY < 50) {
                started = true;
                tl.play();
            }
        }, 3500);

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50 && started) {
                tl.kill();
                gsap.to(hint, { opacity: 0, duration: 0.3 });
                started = false;
            }
        }, { passive: true });
    }
}

/* ════════════════════════════════════════════════════════
   THEME TOGGLE
   ════════════════════════════════════════════════════════ */
function initTheme() {
    const html   = document.documentElement;
    const btn    = document.getElementById('themeToggle');
    const STORAGE_KEY = 'yoge-theme';

    /* Restore saved preference — default to dark */
    const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
    html.setAttribute('data-theme', saved);

    if (!btn) return;

    btn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme') || 'dark';
        const next    = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem(STORAGE_KEY, next);

        /* Re-apply accent-colour lerp so hue-shift works on light bg too */
        if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
}

/* ════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, TextPlugin);

    initTheme();
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
    initMobileAnimations(); /* CSS-class-based entrance animations for mobile/tablet */
    initTouchInteractions(); /* Mobile touch ripple & swipe hints */

    document.fonts.ready.then(() => ScrollTrigger.refresh());
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt=setTimeout(()=>ScrollTrigger.refresh(),300); }, { passive:true });

    /* Fallback at 4500ms — well after loading screen closes (~2.5s).
       Only fixes elements that are IN the viewport AND still stuck at opacity:0.
       Runs late to avoid killing GSAP entrance animations mid-setup. */
    setTimeout(() => {
        const isMobile = window.innerWidth <= 1024;
        const vh = window.innerHeight;

        if (!isMobile) {
            /* Desktop: fix any element in-viewport that GSAP left stuck */
            document.querySelectorAll('section *').forEach(el => {
                try {
                    /* Skip scroll-hint — it's intentionally managed separately */
                    if (el.classList.contains('hero-scroll-hint') ||
                        el.closest('.hero-scroll-hint')) return;

                    const rect = el.getBoundingClientRect();
                    const inView = rect.top < vh && rect.bottom > 0;
                    if (!inView) return; /* only fix in-viewport elements */

                    const stuck =
                        el.style.opacity === '0' ||
                        (el.style.clipPath && el.style.clipPath !== 'none');
                    if (stuck && el.offsetParent !== null) {
                        el.style.opacity   = '1';
                        el.style.transform = 'none';
                        el.style.clipPath  = 'none';
                    }
                } catch(e) {}
            });
        }
        ScrollTrigger.refresh();
    }, 4500);
});