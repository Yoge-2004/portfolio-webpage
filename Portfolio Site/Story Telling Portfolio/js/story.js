/*!
 * STORY.JS  ·  YOGE.DEV  ·  Awwwards-grade Animation Engine
 * GSAP 3.12 · SplitText · DrawSVG · Lenis · ScrollTrigger
 */
'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const mob = () => window.innerWidth < 768;
const tab = () => window.innerWidth < 1024;

/* ════════════════════════════════════════════════════════
   1. LENIS — physics-based smooth scroll
   ════════════════════════════════════════════════════════ */
let lenis;
function initLenis() {
    if (mob()) return; // native scroll on mobile
    if (typeof Lenis === 'undefined') return;

    lenis = new Lenis({
        duration: 1.4,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.5,
        infinite: false,
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Expose globally so nav clicks can use lenis.scrollTo
    window._lenis = lenis;
}

/* ════════════════════════════════════════════════════════
   2. NOISE GRAIN OVERLAY
   ════════════════════════════════════════════════════════ */
function initGrain() {
    const canvas = document.createElement('canvas');
    canvas.id = 'grain';
    canvas.style.cssText = `
        position:fixed; top:0; left:0; width:100%; height:100%;
        pointer-events:none; z-index:1;
        opacity:0.018;
        mix-blend-mode:overlay;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let frame = 0;

    function resize() {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    function render() {
        frame++;
        if (frame % 3 !== 0) { requestAnimationFrame(render); return; } // 20fps grain
        const { width, height } = canvas;
        const image = ctx.createImageData(width, height);
        const data  = image.data;
        for (let i = 0; i < data.length; i += 4) {
            const v = (Math.random() * 255) | 0;
            data[i] = data[i+1] = data[i+2] = v;
            data[i+3] = 255;
        }
        ctx.putImageData(image, 0, 0);
        requestAnimationFrame(render);
    }
    render();
}

/* ════════════════════════════════════════════════════════
   3. CURSOR — morphing label cursor
   ════════════════════════════════════════════════════════ */
function initCursor() {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    const dot   = $('.cursor__dot');
    const ring  = $('.cursor__ring');
    const label = $('.cursor__label') || (() => {
        const el = document.createElement('div');
        el.className = 'cursor__label';
        el.id = 'cursorLabel';
        document.getElementById('cursor')?.appendChild(el);
        return el;
    })();
    if (!dot || !ring) return;

    let rx = -500, ry = -500, mx = -500, my = -500;
    let currentLabel = '';

    // Cursor label map by data-cursor attribute
    const LABELS = {
        'card':   'View',
        'button': '',
        'nav':    '',
        'logo':   'Home',
        'drag':   '⟵ Drag ⟶',
        'link':   'Open ↗',
    };

    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform  = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
        dot.style.opacity    = ring.style.opacity = '1';
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
        dot.style.opacity = ring.style.opacity = '0';
    });

    document.addEventListener('mousedown', () => {
        ring.classList.add('is-click');
        gsap.to(dot, { scale: 0.6, duration: 0.15, ease: 'power2.out' });
    });
    document.addEventListener('mouseup', () => {
        ring.classList.remove('is-click');
        gsap.to(dot, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
    });

    // RAF loop for smooth ring lag
    (function loop() {
        rx += (mx - rx) * 0.10;
        ry += (my - ry) * 0.10;
        ring.style.transform = `translate(${rx.toFixed(1)}px,${ry.toFixed(1)}px) translate(-50%,-50%)`;
        requestAnimationFrame(loop);
    })();

    // Hover states with label
    document.querySelectorAll('[data-cursor]').forEach(el => {
        el.addEventListener('mouseenter', () => {
            const type = el.dataset.cursor;
            const lbl  = LABELS[type] || '';
            dot.classList.add('is-hover');
            ring.classList.add('is-hover');
            ring.classList.add(`is-${type}`);
            if (lbl !== currentLabel) {
                currentLabel = lbl;
                if (label) {
                    label.textContent = lbl;
                    gsap.fromTo(label,
                        { opacity: 0, y: 6 },
                        { opacity: lbl ? 1 : 0, y: 0, duration: 0.3, ease: 'power2.out' }
                    );
                }
            }
        }, { passive: true });

        el.addEventListener('mouseleave', () => {
            const type = el.dataset.cursor;
            dot.classList.remove('is-hover');
            ring.classList.remove('is-hover');
            ring.classList.remove(`is-${type}`);
            currentLabel = '';
            if (label) gsap.to(label, { opacity: 0, y: -4, duration: 0.2 });
        }, { passive: true });
    });
}

/* ════════════════════════════════════════════════════════
   4. LOADING
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
   5. HERO ENTRY — SplitText character cascade
   ════════════════════════════════════════════════════════ */
function heroEntry() {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // SplitText on hero headline — character by character
    const headline = $('.hero-headline');
    let splitChars = null;
    if (headline && typeof SplitText !== 'undefined') {
        try {
            const split = new SplitText(headline, { type: 'chars,words', charsClass: 'char' });
            splitChars = split.chars;
            gsap.set(headline, { opacity: 1 });
            tl.fromTo(splitChars,
                { y: 120, opacity: 0, rotationX: -80, transformPerspective: 800, transformOrigin: '50% 100%' },
                { y: 0, opacity: 1, rotationX: 0, duration: 1.1, stagger: 0.035, ease: 'back.out(1.8)' },
                0.6
            );
        } catch(e) {
            tl.fromTo(headline, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9 }, 0.55);
        }
    } else {
        tl.fromTo(headline, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9 }, 0.55);
    }

    tl.fromTo('.hero-image__mask',  { clipPath: 'inset(100% 0 0 0)' },    { clipPath: 'inset(0% 0 0 0)', duration: 1.2, ease: 'power4.inOut' }, 0)
      .fromTo('.hero-image__img',   { scale: 1.15 },                       { scale: 1, duration: 1.8 }, 0)
      .fromTo('.hero-image__border',{ opacity: 0, scale: 0.8 },            { opacity: 0.6, scale: 1, duration: 1.0, ease: 'back.out(1.4)' }, 0.5)
      .fromTo('.hero-image__glow',  { opacity: 0 },                        { opacity: 1, duration: 1.4 }, 0.6)
      .fromTo('.hero-badge',        { opacity: 0, y: 20, scale: 0.8 },     { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(2)' }, 1.0)
      .fromTo('.hero-kicker',       { opacity: 0, x: -30, skewX: -6 },     { opacity: 1, x: 0, skewX: 0, duration: 0.8 }, 0.4)
      .fromTo('.hero-tagline',      { opacity: 0, y: 24 },                  { opacity: 1, y: 0, duration: 0.8 }, 0.9)
      .fromTo('.hero-metrics',      { opacity: 0, y: 22, scale: 0.96 },    { opacity: 1, y: 0, scale: 1, duration: 0.8 }, 1.05)
      .fromTo('.hero-cta',          { opacity: 0, y: 22 },                  { opacity: 1, y: 0, duration: 0.8 }, 1.2)
      .fromTo('.hero-scroll-hint',  { opacity: 0 },                         { opacity: 1, duration: 0.8 }, 1.8);

    // Counters
    $$('[data-count]').forEach(el => {
        const end = +el.dataset.count, obj = { v: 0 };
        tl.to(obj, { v: end, duration: 2.2, ease: 'power2.out',
            onUpdate() { el.textContent = Math.round(obj.v); }
        }, 1.1);
    });

    // Hero parallax depth
    if (!tab()) {
        gsap.to('.hero-image__frame', { yPercent: -16, ease: 'none',
            scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.to('.hero-kicker, .hero-headline, .hero-tagline', { yPercent: -8, ease: 'none',
            scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true } });
    }

    // Scroll hint fade
    gsap.fromTo('.hero-scroll-hint', { opacity: 1, y: 0 }, { opacity: 0, y: 8, ease: 'none',
        scrollTrigger: {
            trigger: '.hero-section', start: '5% top', end: '18% top', scrub: true, once: false,
            onLeave: ()     => $('.hero-scroll-hint')?.classList.add('is-scroll-hidden'),
            onEnterBack: () => $('.hero-scroll-hint')?.classList.remove('is-scroll-hidden'),
        }
    });
}

/* ════════════════════════════════════════════════════════
   6. NAV
   ════════════════════════════════════════════════════════ */
function initNav() {
    const nav    = $('.main-nav');
    const toggle = $('#menuToggle');
    const menu   = $('#mobileMenu');
    const closeB = $('#mobileClose');
    const bd     = $('.mobile-menu__backdrop');

    let lastY = 0, ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const y = window.scrollY;
                nav?.classList.toggle('is-scrolled', y > 50);
                nav?.classList.toggle('is-hidden', y > lastY + 8 && y > 200);
                if (y < lastY || y < 200) nav?.classList.remove('is-hidden');
                lastY = y;
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Scroll progress
    function updateProgress() {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        if (total <= 0) return;
        const pct = Math.min(100, (window.scrollY / total) * 100);
        const fill = $('.scroll-progress__fill');
        if (fill) fill.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    setTimeout(updateProgress, 3200);

    // Scrollspy
    const sections  = Array.from($$('.story-section[id]'));
    const linkMap   = {};
    $$('.nav-link[href^="#"]').forEach(l => { linkMap[l.getAttribute('href').slice(1)] = l; });

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

    const openMenu  = () => { menu?.classList.add('is-open');    toggle?.classList.add('is-open');    document.body.style.overflow = 'hidden'; };
    const closeMenu = () => { menu?.classList.remove('is-open'); toggle?.classList.remove('is-open'); document.body.style.overflow = ''; };
    toggle?.addEventListener('click', () => menu?.classList.contains('is-open') ? closeMenu() : openMenu());
    closeB?.addEventListener('click', closeMenu);
    bd?.addEventListener('click', closeMenu);

    $$('.mobile-link').forEach(l => l.addEventListener('click', () => {
        const id = l.getAttribute('href'); closeMenu();
        setTimeout(() => $(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
    }));

    $$('.nav-link[href^="#"]').forEach(l => l.addEventListener('click', e => {
        e.preventDefault();
        const target = $(l.getAttribute('href'));
        if (!target) return;
        if (window._lenis) {
            window._lenis.scrollTo(target, { offset: -80, duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) });
        } else {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }));

    $('.nav-logo')?.addEventListener('click', e => {
        e.preventDefault();
        if (window._lenis) window._lenis.scrollTo(0, { duration: 1.4 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    $('.top-button')?.addEventListener('click', () => {
        if (window._lenis) window._lenis.scrollTo(0, { duration: 1.4 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ════════════════════════════════════════════════════════
   7. TEXT MASK REVEALS — lines rise from behind mask
   ════════════════════════════════════════════════════════ */
function initTextMaskReveals() {
    // Wrap each section title in a mask container
    $$('.section-title').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            gsap.set(el, { opacity: 1 });
            return;
        }
        // Mask reveal: text rises from y:100% behind overflow:hidden wrapper
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'overflow:hidden; display:block;';
        el.parentNode.insertBefore(wrapper, el);
        wrapper.appendChild(el);
        gsap.set(el, { y: '105%', opacity: 1 });
        ScrollTrigger.create({
            trigger: wrapper,
            start: 'top 88%',
            once: true,
            onEnter: () => {
                gsap.to(el, { y: '0%', duration: 1.1, ease: 'power4.out' });
            }
        });
    });

    // Section eyebrows — letter-spacing expand + fade
    $$('.section-eyebrow').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) { gsap.set(el, { opacity: 1 }); return; }
        gsap.fromTo(el,
            { opacity: 0, y: 16, letterSpacing: '20px' },
            { opacity: 1, y: 0, letterSpacing: '6px', duration: 1.0, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
        );
    });

    // Section subtitles — SplitText word stagger
    $$('.section-subtitle').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) { gsap.set(el, { opacity: 1 }); return; }
        if (typeof SplitText !== 'undefined') {
            try {
                const split = new SplitText(el, { type: 'lines', linesClass: 'st-line' });
                gsap.set(el, { opacity: 1 });
                gsap.fromTo(split.lines,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out',
                      scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
                );
                return;
            } catch(e) {}
        }
        gsap.fromTo(el, { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 90%', once: true } }
        );
    });
}

/* ════════════════════════════════════════════════════════
   8. HORIZONTAL SCROLL — Quests + Battles sections
   ════════════════════════════════════════════════════════ */
function initHorizontalScroll() {
    if (tab()) return;

    // ── BATTLES — staggered card entrance (no horizontal scroll: pin+width
    //    calculation was racing against layout, collapsing 1fr → 0px) ──
    const battlesSection = $('.battles-section');
    const battleGrid     = $('.battle-grid');
    if (battlesSection && battleGrid) {
        // Restore grid to normal flow in case a previous run wrapped cards
        const track = battleGrid.querySelector('.h-scroll-track');
        if (track) {
            while (track.firstChild) battleGrid.insertBefore(track.firstChild, track);
            track.remove();
            battleGrid.style.overflow = '';
        }
        battlesSection.removeAttribute('data-cursor');

        const cards = $$('.battle-card', battleGrid);
        if (cards.length) {
            gsap.fromTo(cards,
                { opacity: 0, y: 60, scale: 0.93 },
                {
                    opacity: 1, y: 0, scale: 1,
                    duration: 0.75,
                    ease: 'power3.out',
                    stagger: { each: 0.12, from: 'start' },
                    scrollTrigger: {
                        trigger: battleGrid,
                        start: 'top 88%',
                        once: true,
                    }
                }
            );
        }

        const featured = $('.battle-featured', battlesSection);
        if (featured) {
            gsap.fromTo(featured,
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: featured,
                        start: 'top 85%',
                        once: true,
                    }
                }
            );
        }
    }

    // ── QUESTS second projects row — horizontal marquee on scroll ──
    const projectGrid = $('.project-grid');
    if (projectGrid) {
        const projectCards = $$('.project-card', projectGrid);
        if (projectCards.length > 1) {
            gsap.fromTo(projectCards,
                { x: (i) => i % 2 === 0 ? 120 : -120, opacity: 0, scale: 0.88 },
                {
                    x: 0, opacity: 1, scale: 1,
                    duration: 1.0,
                    stagger: { each: 0.14, from: 'center' },
                    ease: 'expo.out',
                    scrollTrigger: { trigger: projectGrid, start: 'top 88%', once: true }
                }
            );
        }
    }
}

/* ════════════════════════════════════════════════════════
   9. STACKING CARDS — Credentials section
   ════════════════════════════════════════════════════════ */
function initStackingCards() {
    if (tab()) return;
    const certItems = $$('.cert-item');
    if (certItems.length < 3) return;

    certItems.forEach((card, i) => {
        gsap.fromTo(card,
            {
                opacity: 0,
                y: 60 + i * 10,
                scale: 0.94 - i * 0.015,
                rotateX: 8,
                transformPerspective: 1000,
                transformOrigin: '50% 100%',
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                duration: 0.9,
                delay: i * 0.08,
                ease: 'back.out(1.3)',
                scrollTrigger: { trigger: '.certs-panel', start: 'top 88%', once: true }
            }
        );
    });
}

/* ════════════════════════════════════════════════════════
   10. SCROLL SCENES — full cinematic choreography
   ════════════════════════════════════════════════════════ */
function initScrollScenes() {
    if (tab()) {
        gsap.to('.timeline__progress', { height: '100%', ease: 'none',
            scrollTrigger: { trigger: '.timeline', start: 'top 65%', end: 'bottom 35%', scrub: 1 } });
        return;
    }

    const pow  = 'power3.out';
    const expo = 'expo.out';

    ScrollTrigger.defaults({ once: true, fastScrollEnd: true, preventOverlaps: true });

    /* ── ORIGIN ── */
    $$('.narrative-block').forEach((block, bi) => {
        // SplitText line-by-line reveal
        if (typeof SplitText !== 'undefined') {
            try {
                const split = new SplitText(block, { type: 'lines', linesClass: 'st-line' });
                gsap.set(block, { opacity: 1 });
                gsap.fromTo(split.lines,
                    { opacity: 0, y: 30, skewY: 2 },
                    { opacity: 1, y: 0, skewY: 0, duration: 0.75, stagger: 0.1, ease: pow,
                      scrollTrigger: { trigger: block, start: 'top 92%', once: true } }
                );
                return;
            } catch(e) {}
        }
        gsap.fromTo(block, { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 0.9, delay: bi * 0.08, ease: pow,
              scrollTrigger: { trigger: block, start: 'top 95%', once: true } }
        );
    });

    $$('.origin-card').forEach((card, i) =>
        gsap.fromTo(card,
            { opacity: 0, y: 70, rotateX: 25, scale: 0.88, transformPerspective: 1000 },
            { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 0.9, delay: i * 0.12, ease: 'back.out(1.4)',
              scrollTrigger: { trigger: '.origin-cards', start: 'top 92%', once: true } })
    );

    /* ── JOURNEY — scrubbed SVG line draw ── */
    gsap.to('.timeline__progress', { height: '100%', ease: 'none',
        scrollTrigger: { trigger: '.timeline', start: 'top 65%', end: 'bottom 35%', scrub: 1.2 } });

    $$('.timeline-entry').forEach((entry, i) => {
        const card   = $('.timeline-entry__card', entry);
        const marker = $('.timeline-entry__marker', entry);
        if (!card) return;
        const fromX  = i % 2 === 0 ? -80 : 80;
        gsap.fromTo(card,
            { opacity: 0, x: fromX, scale: 0.92, rotateY: i % 2 === 0 ? -12 : 12, transformPerspective: 1200 },
            { opacity: 1, x: 0, scale: 1, rotateY: 0, duration: 1.0, ease: expo,
              scrollTrigger: { trigger: card, start: 'top 90%', once: true } }
        );
        if (marker) gsap.fromTo(marker, { opacity: 0, scale: 0, rotation: -180 },
            { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(2.5)',
              scrollTrigger: { trigger: card, start: 'top 90%', once: true } }
        );
    });

    /* ── QUESTS ── */
    gsap.fromTo('.project-hero',
        { opacity: 0, y: 80, scale: 0.88, transformPerspective: 1400 },
        { opacity: 1, y: 0, scale: 1, duration: 1.3, ease: expo,
          scrollTrigger: { trigger: '.project-hero', start: 'top 90%', once: true } }
    );
    gsap.fromTo('.project-hero__icon',
        { opacity: 0, scale: 0, rotation: -180 },
        { opacity: 1, scale: 1, rotation: 0, duration: 1.1, ease: 'back.out(2)', delay: 0.3,
          scrollTrigger: { trigger: '.project-hero', start: 'top 90%', once: true } }
    );
    gsap.fromTo('.tech-pill',
        { opacity: 0, y: 22, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.6, ease: pow,
          scrollTrigger: { trigger: '.project-hero__tech', start: 'top 92%', once: true } }
    );

    /* ── BATTLES — staggered throw (horizontal scroll handles the main animation) ── */
    gsap.fromTo('.battle-featured',
        { opacity: 0, x: -100, skewX: -4, scale: 0.95 },
        { opacity: 1, x: 0, skewX: 0, scale: 1, duration: 1.2, ease: expo,
          scrollTrigger: { trigger: '.battle-featured', start: 'top 92%', once: true } }
    );
    gsap.fromTo('.badge, .win-badge',
        { opacity: 0, scale: 0, y: 12 },
        { opacity: 1, scale: 1, y: 0, stagger: 0.05, duration: 0.6, ease: 'back.out(2.5)',
          scrollTrigger: { trigger: '.battle-featured', start: 'top 92%', once: true } }
    );

    /* ── DISCOVERY ── */
    gsap.fromTo('.research-paper',
        { opacity: 0, y: 90, scale: 0.95, rotateX: 6, transformPerspective: 1200 },
        { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 1.3, ease: expo,
          scrollTrigger: { trigger: '.research-paper', start: 'top 90%', once: true } }
    );
    ['.research-paper__venue', '.abstract-block', '.keywords-block',
     '.results-block', '.authors-block', '.project-link-block', '.paper-actions-row', '.flags-row'
    ].forEach((sel, i) => {
        const el = $(sel); if (!el) return;
        gsap.fromTo(el, { opacity: 0, y: 32 },
            { opacity: 1, y: 0, duration: 0.75, delay: i * 0.08, ease: 'power2.out',
              scrollTrigger: { trigger: '.research-paper', start: 'top 90%', once: true } }
        );
    });
    $$('.result-card').forEach((card, i) =>
        gsap.fromTo(card,
            { opacity: 0, scale: 0.65, y: 50, rotateX: 20, transformPerspective: 800 },
            { opacity: 1, scale: 1, y: 0, rotateX: 0, duration: 0.9, delay: i * 0.18, ease: 'back.out(1.8)',
              scrollTrigger: { trigger: '.result-cards', start: 'top 92%', once: true } })
    );
    gsap.fromTo('.kw-tag',
        { opacity: 0, scale: 0.6, y: 12 },
        { opacity: 1, scale: 1, y: 0, stagger: 0.05, duration: 0.55, ease: 'back.out(2)',
          scrollTrigger: { trigger: '.keywords-block', start: 'top 92%', once: true } }
    );

    /* ── CREDENTIALS ── */
    gsap.fromTo('.skills-panel',
        { opacity: 0, x: -90, scale: 0.94 },
        { opacity: 1, x: 0, scale: 1, duration: 1.2, ease: expo,
          scrollTrigger: { trigger: '.credentials-section', start: 'top 90%', once: true } }
    );
    $$('.skill-group__header').forEach((el, i) =>
        gsap.fromTo(el, { opacity: 0, x: -35 },
            { opacity: 1, x: 0, duration: 0.7, delay: 0.3 + i * 0.12, ease: pow,
              scrollTrigger: { trigger: '.skills-panel', start: 'top 92%', once: true } })
    );
    gsap.fromTo('.certs-panel',
        { opacity: 0, y: -70, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, delay: 0.1, ease: expo,
          scrollTrigger: { trigger: '.credentials-section', start: 'top 90%', once: true } }
    );
    gsap.fromTo(['.skills-panel .panel-title', '.certs-panel .panel-title'],
        { opacity: 0, y: 22, clipPath: 'inset(0 100% 0 0)' },
        { opacity: 1, y: 0, clipPath: 'inset(0 0% 0 0)', duration: 1.0, stagger: 0.15, ease: 'power4.inOut',
          scrollTrigger: { trigger: '.credentials-section', start: 'top 90%', once: true } }
    );

    /* ── CONTACT ── */
    $$('.contact-card').forEach((el, i) =>
        gsap.fromTo(el,
            { opacity: 0, y: 60, scale: 0.92, rotateX: 10, transformPerspective: 900 },
            { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.95, delay: i * 0.16, ease: expo,
              scrollTrigger: { trigger: '.contact-section', start: 'top 90%', once: true } })
    );

    /* ── Section orb parallax ── */
    if (!mob()) {
        $$('.section-bg__orb').forEach((o, i) =>
            gsap.to(o, { y: i % 2 === 0 ? -70 : -45, ease: 'none',
                scrollTrigger: { trigger: o.closest('section'), start: 'top bottom', end: 'bottom top', scrub: 2.5 } })
        );
        // Subtle multi-speed card parallax for depth
        $$('.project-card, .battle-card, .origin-card').forEach((card, i) =>
            gsap.to(card, {
                yPercent: i % 2 === 0 ? -5 : -10, ease: 'none',
                scrollTrigger: {
                    trigger: card.closest('.story-section'),
                    start: 'top bottom', end: 'bottom top', scrub: 1.8
                }
            })
        );
    }
}

/* ════════════════════════════════════════════════════════
   11. RESULT CARDS — counter + fill
   ════════════════════════════════════════════════════════ */
function initResultCards() {
    $$('.result-card').forEach(card => {
        const fill  = card.querySelector('.result-card__fill');
        const numEl = card.querySelector('.result-card__number');
        if (!fill || !numEl) return;
        const styleAttr = fill.getAttribute('style') || '';
        const m = styleAttr.match(/width:\s*([\d.]+)%/);
        const targetW = parseFloat(m?.[1] || '99');
        const targetN = parseFloat(numEl.dataset.count || numEl.textContent.replace(/[^\d.]/g, '')) || 99;
        const isDecimal = targetN % 1 !== 0;
        fill.dataset.targetW = targetW;
        fill.removeAttribute('style');
        let fired = false;
        const obs = new IntersectionObserver(entries => {
            if (!entries[0].isIntersecting || fired) return;
            fired = true; obs.disconnect();
            requestAnimationFrame(() => {
                gsap.fromTo(fill, { width: '0%' }, { width: targetW + '%', duration: 2.0, ease: 'power3.out', delay: 0.2 });
                const obj = { v: 0 };
                gsap.to(obj, { v: targetN, duration: 2.0, ease: 'power3.out',
                    onUpdate() { numEl.textContent = isDecimal ? obj.v.toFixed(2) : Math.round(obj.v); }
                });
            });
        }, { threshold: 0.05 });
        obs.observe(card);
    });
}

/* ════════════════════════════════════════════════════════
   12. SKILL BARS — staggered animated fill
   ════════════════════════════════════════════════════════ */
function initSkillBars() {
    $$('.skill-bar__fill').forEach((bar, i) => {
        const w = bar.dataset.width || '80';
        bar.style.width = '0%';
        const obs = new IntersectionObserver(entries => {
            if (!entries[0].isIntersecting) return;
            gsap.to(bar, { width: w + '%', duration: 1.8, ease: 'power3.out', delay: 0.1 + i * 0.05 });
            obs.disconnect();
        }, { threshold: 0.3 });
        obs.observe(bar);
    });
}

/* ════════════════════════════════════════════════════════
   13. MARQUEE
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
        strip.appendChild(inner);
        ref.insertAdjacentElement('afterend', strip);
        const buildMarquee = () => {
            const reps = Math.max(30, Math.ceil(window.innerWidth / 40));
            inner.innerHTML = Array(reps).fill(`<span>${text}</span>`).join('');
        };
        buildMarquee();
        let rt;
        window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(buildMarquee, 300); }, { passive: true });
    });
}

/* ════════════════════════════════════════════════════════
   14. CHAPTER FLASH — cinematic scene title
   ════════════════════════════════════════════════════════ */
function initChapterFlash() {
    const el = document.createElement('div');
    el.id = 'chflash';
    el.innerHTML = '<b class="cf-n"></b><span class="cf-t"></span>';
    document.body.appendChild(el);
    const CHAPTERS = [
        ['origin','01','The Origin'], ['journey','02','The Journey'],
        ['quests','03','The Quests'], ['battles','04','The Battles'],
        ['discovery','05','The Discovery'], ['credentials','06','Credentials'],
        ['contact','07','Connect'],
    ];
    let cd = false;
    const fire = (n, t) => {
        if (cd) return; cd = true; setTimeout(() => { cd = false; }, 1000);
        el.querySelector('.cf-n').textContent = n;
        el.querySelector('.cf-t').textContent = t;
        gsap.timeline()
            .set(el, { display: 'flex', opacity: 0, y: 20 })
            .to(el,  { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' })
            .to(el,  { opacity: 0, y: -16, duration: 0.5, delay: 0.3, ease: 'power2.in' })
            .set(el, { display: 'none' });
    };
    CHAPTERS.forEach(([id, n, t]) => {
        const sec = document.getElementById(id); if (!sec) return;
        const obs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) fire(n, t);
        }, { threshold: 0.05, rootMargin: '-5% 0px -5% 0px' });
        obs.observe(sec);
    });
}

/* ════════════════════════════════════════════════════════
   15. JOURNEY PROGRESS (redundant safety, covered in scrollScenes)
   ════════════════════════════════════════════════════════ */
function initJourney() {
    const section = $('.journey-section'); if (!section) return;
    // Already handled in initScrollScenes; this is a safety net
}

/* ════════════════════════════════════════════════════════
   16. GLITCH on eyebrows
   ════════════════════════════════════════════════════════ */
function initGlitch() {
    const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    $$('.section-eyebrow').forEach(el => {
        let iv = null;
        const orig = el.getAttribute('data-orig') || el.textContent.trim();
        el.setAttribute('data-orig', orig);
        el.addEventListener('mouseenter', () => {
            if (iv) { clearInterval(iv); iv = null; }
            let f = 0;
            const total = orig.length * 2.8;
            iv = setInterval(() => {
                const revealed = Math.floor((f / total) * orig.length);
                el.textContent = orig.split('').map((c, i) => {
                    if (c === ' ' || c === '·') return c;
                    if (i < revealed) return c;
                    return CH[Math.random() * CH.length | 0];
                }).join('');
                f++;
                if (f >= total) { el.textContent = orig; clearInterval(iv); iv = null; }
            }, 28);
        }, { passive: true });
        el.addEventListener('mouseleave', () => {
            if (iv) { clearInterval(iv); iv = null; el.textContent = orig; }
        }, { passive: true });
    });
}

/* ════════════════════════════════════════════════════════
   17. SPOTLIGHT on hero
   ════════════════════════════════════════════════════════ */
function initSpotlight() {
    const hero = $('.hero-section'); if (!hero || mob()) return;
    hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect();
        hero.style.setProperty('--sx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        hero.style.setProperty('--sy', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
}

/* ════════════════════════════════════════════════════════
   18. TILT
   ════════════════════════════════════════════════════════ */
function initTilt() {
    if (mob() || typeof VanillaTilt === 'undefined') return;
    VanillaTilt.init(document.querySelectorAll('.origin-card'), { max: 10, speed: 600, glare: false, perspective: 900, scale: 1.03, gyroscope: false });
    VanillaTilt.init(document.querySelectorAll('.project-card'), { max: 8, speed: 500, glare: false, perspective: 1000, scale: 1.025, gyroscope: false });
    VanillaTilt.init(document.querySelectorAll('.battle-card'), { max: 6, speed: 500, glare: false, perspective: 1000, scale: 1.02, gyroscope: false });
}

/* ════════════════════════════════════════════════════════
   19. TYPED.JS
   ════════════════════════════════════════════════════════ */
function initTyped() {
    const el = document.getElementById('typed-role');
    if (!el || typeof Typed === 'undefined') return;
    new Typed(el, {
        strings: ['Software Developer', 'ML &amp; NLP Researcher', 'Full Stack Engineer', 'Spring Boot Architect', 'Open Source Builder'],
        typeSpeed: 42, backSpeed: 32, backDelay: 1800, startDelay: 600,
        loop: true, smartBackspace: false, showCursor: true, cursorChar: '|',
    });
}

/* ════════════════════════════════════════════════════════
   20. PARTICLES
   ════════════════════════════════════════════════════════ */
function initParticles() {
    const wrap = $('#heroParticles'); if (!wrap) return;
    const N = mob() ? 12 : 28;
    const f = document.createDocumentFragment();
    for (let i = 0; i < N; i++) {
        const s = document.createElement('span');
        s.style.cssText = [
            `position:absolute`,
            `left:${(Math.random() * 100).toFixed(1)}%`,
            `bottom:0`,
            `width:${(0.5 + Math.random() * 1.6).toFixed(1)}px`,
            `height:${(0.5 + Math.random() * 1.6).toFixed(1)}px`,
            `border-radius:50%`,
            `background:rgba(${Math.random() > 0.5 ? '102,231,242' : '154,140,255'},${(0.1 + Math.random() * 0.5).toFixed(2)})`,
            `animation:pRise ${(10 + Math.random() * 22).toFixed(1)}s linear ${-(Math.random() * 20).toFixed(1)}s infinite`,
            `will-change:transform`,
            `pointer-events:none`,
        ].join(';');
        f.appendChild(s);
    }
    wrap.appendChild(f);
}

/* ════════════════════════════════════════════════════════
   21. MAGNETIC BUTTONS — improved spring physics
   ════════════════════════════════════════════════════════ */
function initMagneticButtons() {
    if (mob()) return;
    $$('.btn--primary, .btn--ghost, .btn--accent, .nav-link').forEach(btn => {
        btn.addEventListener('mousemove', e => {
            const r  = btn.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const dist = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2));
            const strength = Math.max(0, 1 - dist / 120);
            const dx = (e.clientX - cx) * 0.38 * strength;
            const dy = (e.clientY - cy) * 0.38 * strength;
            gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        });
        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1.2, 0.4)', overwrite: 'auto' });
        });
    });
}

/* ════════════════════════════════════════════════════════
   22. FLOATING ELEMENTS + MOUSE RIPPLE
   ════════════════════════════════════════════════════════ */
function initFloatingElements() {
    const badge = $('.hero-badge');
    if (badge) badge.classList.add('is-floating');

    $$('.contact-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
            card.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%');
        }, { passive: true });
    });

    $$('.narrative-block').forEach((block, i) => {
        ScrollTrigger.create({
            trigger: block,
            start: 'top 88%',
            onEnter: () => setTimeout(() => block.classList.add('is-visible'), i * 120),
        });
    });
}

/* ════════════════════════════════════════════════════════
   23. SECTION WIPE TRANSITIONS — clip-path between sections
   ════════════════════════════════════════════════════════ */
function initSectionWipes() {
    if (tab()) return;

    $$('.story-section:not(.hero-section)').forEach((section, i) => {
        // Accent line that sweeps across on enter
        const wipe = document.createElement('div');
        wipe.className = 'section-wipe-line';
        wipe.style.cssText = `
            position:absolute; top:0; left:0; right:0; height:2px;
            background:linear-gradient(90deg, transparent, var(--accent-cyan), var(--accent-purple), transparent);
            transform:scaleX(0); transform-origin:left center;
            z-index:10; pointer-events:none;
        `;
        section.style.position = 'relative';
        section.insertBefore(wipe, section.firstChild);

        ScrollTrigger.create({
            trigger: section,
            start: 'top 95%',
            once: true,
            onEnter: () => {
                gsap.fromTo(wipe,
                    { scaleX: 0, opacity: 1 },
                    { scaleX: 1, opacity: 0, duration: 1.0, ease: 'power3.inOut', delay: i * 0.02 }
                );
            }
        });
    });
}

/* ════════════════════════════════════════════════════════
   24. HOVER IMAGE DISTORTION on cards
   ════════════════════════════════════════════════════════ */
function initCardHoverFX() {
    if (mob()) return;
    $$('.battle-card, .project-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                '--shine-x': '110%',
                duration: 0.6,
                ease: 'power2.out',
                overwrite: true,
            });
        });
        card.addEventListener('mouseleave', () => {
            gsap.set(card, { '--shine-x': '-20%' });
        });
    });
}

/* ════════════════════════════════════════════════════════
   25. MOBILE ANIMATIONS
   ════════════════════════════════════════════════════════ */
function initMobileAnimations() {
    if (window.innerWidth >= 1024) return;
    const SELECTORS = [
        '.origin-card', '.project-card', '.battle-card', '.battle-featured',
        '.cert-item', '.result-card', '.timeline-entry__card',
        '.timeline-entry__marker', '.contact-card', '.research-paper',
        '.narrative-block', '.section-eyebrow', '.section-title', '.section-subtitle',
    ];
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
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
                el.classList.add('mob-entering');
                io.observe(el);
            }
        });
    });

    $$('.skill-bar__fill').forEach(fill => {
        const tw = fill.dataset.width ? fill.dataset.width + '%' : '80%';
        fill.style.setProperty('--target-width', tw);
        if (fill.getBoundingClientRect().top >= window.innerHeight) {
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
   26. TOUCH INTERACTIONS
   ════════════════════════════════════════════════════════ */
function initTouchInteractions() {
    if (!window.matchMedia('(pointer:coarse)').matches) return;
    $$('.btn, .origin-card, .project-card, .battle-card, .contact-card').forEach(el => {
        el.addEventListener('touchstart', () => {
            gsap.to(el, { scale: 0.95, duration: 0.15, ease: 'power2.out', overwrite: 'auto' });
        }, { passive: true });
        const reset = () => gsap.to(el, { scale: 1, duration: 0.4, ease: 'power2.out', overwrite: 'auto', clearProps: 'scale' });
        el.addEventListener('touchend', reset, { passive: true });
        el.addEventListener('touchcancel', reset, { passive: true });
    });
}

/* ════════════════════════════════════════════════════════
   27. MODAL
   ════════════════════════════════════════════════════════ */
function initModal() {
    const ov = $('.modal-overlay'); if (!ov) return;
    const close = () => { ov.classList.remove('is-active'); document.body.style.overflow = ''; };
    const open  = () => { ov.classList.add('is-active');    document.body.style.overflow = 'hidden'; };
    $('.modal-close-btn')?.addEventListener('click', close);
    ov.addEventListener('click', e => e.target === ov && close());
    document.addEventListener('keydown', e => e.key === 'Escape' && close());
    $$('[data-modal-open]').forEach(b => b.addEventListener('click', open));
}

/* ════════════════════════════════════════════════════════
   28. THEME TOGGLE
   ════════════════════════════════════════════════════════ */
function initTheme() {
    const html = document.documentElement;
    const btn  = document.getElementById('themeToggle');
    const KEY  = 'yoge-theme';
    const saved = localStorage.getItem(KEY) || 'dark';
    html.setAttribute('data-theme', saved);
    if (!btn) return;
    btn.addEventListener('click', () => {
        const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem(KEY, next);
        if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
}

/* ════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, TextPlugin);
    if (typeof SplitText !== 'undefined')  gsap.registerPlugin(SplitText);
    if (typeof DrawSVGPlugin !== 'undefined') gsap.registerPlugin(DrawSVGPlugin);

    initTheme();
    initLenis();
    initGrain();
    initCursor();
    initParticles();
    initLoading();
    initNav();
    initTextMaskReveals();
    initScrollScenes();
    initHorizontalScroll();
    initStackingCards();
    initResultCards();
    initSkillBars();
    initMarquee();
    initChapterFlash();
    initSectionWipes();
    initCardHoverFX();
    initTilt();
    initTyped();
    initGlitch();
    initSpotlight();
    initModal();
    initMagneticButtons();
    initFloatingElements();
    initMobileAnimations();
    initTouchInteractions();

    document.fonts.ready.then(() => ScrollTrigger.refresh());
    let rt;
    window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => {
            ScrollTrigger.refresh();
            if (window._lenis) window._lenis.resize();
        }, 300);
    }, { passive: true });

    // Fallback visibility fix
    setTimeout(() => {
        if (window.innerWidth <= 1024) return;
        const vh = window.innerHeight;
        document.querySelectorAll('section *').forEach(el => {
            try {
                if (el.classList.contains('hero-scroll-hint') || el.closest('.hero-scroll-hint')) return;
                const rect = el.getBoundingClientRect();
                if (rect.top < vh && rect.bottom > 0) {
                    if ((el.style.opacity === '0' || (el.style.clipPath && el.style.clipPath !== 'none')) && el.offsetParent !== null) {
                        el.style.opacity   = '1';
                        el.style.transform = 'none';
                        el.style.clipPath  = 'none';
                    }
                }
            } catch(e) {}
        });
        ScrollTrigger.refresh();
    }, 5000);
});

/* ════════════════════════════════════════════════════════
   DECO RINGS  —  floating ring decorations per section
   ════════════════════════════════════════════════════════ */
function initDecoRings() {
    const configs = [
        { sel: '.origin-section',      size: 500, x: '8%',  y: '20%' },
        { sel: '.journey-section',     size: 600, x: '88%', y: '70%' },
        { sel: '.quests-section',      size: 450, x: '5%',  y: '65%' },
        { sel: '.battles-section',     size: 550, x: '92%', y: '25%' },
        { sel: '.discovery-section',   size: 480, x: '10%', y: '80%' },
        { sel: '.credentials-section', size: 520, x: '85%', y: '35%' },
        { sel: '.contact-section',     size: 460, x: '15%', y: '60%' },
    ];
    configs.forEach(({ sel, size, x, y }) => {
        const sec = $(sel); if (!sec) return;
        if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
        [1, 0.55].forEach((scale, ri) => {
            const ring = document.createElement('div');
            ring.className = 'deco-ring';
            ring.style.cssText = [
                `width:${size * scale}px`, `height:${size * scale}px`,
                `left:${x}`, `top:${y}`,
                `transform:translate(-50%,-50%)`,
                `position:absolute`,
                `animation-delay:${(ri * 2 + Math.random() * 3).toFixed(1)}s`,
                ri === 1 ? 'opacity:0.4' : '',
            ].filter(Boolean).join(';');
            sec.appendChild(ring);
        });
    });
}

/* ════════════════════════════════════════════════════════
   VISIBILITY FALLBACK  —  fix GSAP opacity:0 leftovers
   on theme switch AND after scroll
   ════════════════════════════════════════════════════════ */
function fixVisibility() {
    const vh = window.innerHeight;
    document.querySelectorAll('section *, .story-section *').forEach(el => {
        try {
            if (el.closest('.hero-scroll-hint') || el.closest('.loading-screen') ||
                el.closest('#yoge-grain')) return;
            const rect = el.getBoundingClientRect();
            if (rect.top < vh + 200 && rect.bottom > -200) {
                if (el.style.opacity === '0') {
                    el.style.opacity   = '1';
                    el.style.transform = 'none';
                    el.style.clipPath  = 'none';
                }
            }
        } catch(e) {}
    });
}

// Patch theme toggle to also fix visibility on switch
(function patchThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        requestAnimationFrame(() => { fixVisibility(); ScrollTrigger?.refresh(); });
    });
})();

// Run fallback at 3s + 6s — catches slow machines and long pages
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(fixVisibility, 3000);
    setTimeout(fixVisibility, 6000);
    // Call initDecoRings after DOM is ready
    setTimeout(initDecoRings, 100);
});
