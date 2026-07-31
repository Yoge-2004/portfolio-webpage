# Implementation Plan: Portfolio Redesign (yoge.dev)

## Overview

Refactor the existing portfolio site from a 25-file CSS split + 2-file JS architecture into a
clean token-driven design system (8 CSS files) and a modular two-file JS engine (`engine.js` +
`fx.js`). The cinematic narrative experience, all section content, and all interactive behaviour
are preserved. Implementation proceeds layer-by-layer: tokens → base CSS → layout/components →
animations/responsive → JS engine → FX layer → HTML wiring → accessibility → final polish.

---

## Tasks

- [x] 1. Create `css/tokens.css` — the single source of design truth
  - Define all color tokens as CSS custom properties on `:root`: background scale (`--bg-darkest`
    through `--bg-card-hover`), accent palette (`--accent-cyan`, `--accent-purple`, etc.), text
    scale (`--text-bright` through `--text-dim`), and font-family tokens
    (`--font-display`, `--font-body`, `--font-mono`)
  - Define all easing tokens: `--ease-out-expo`, `--ease-out-quart`, `--ease-in-out-circ`
  - Define all fluid spacing tokens using `clamp(min, preferred, max)` for `--space-2xs` through
    `--space-3xl`, `--section-py`, `--container-px`, and `--nav-height: 70px`; ensure every
    clamp satisfies `min ≤ preferred ≤ max`
  - Define breakpoint tokens as custom properties for `--bp-mobile` (768px), `--bp-tablet`
    (1024px), `--bp-wide` (1440px), `--bp-4k` (2560px)
  - Do NOT define `--ar`, `--ag`, `--ab` here — these are set by JS at runtime
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 1.1 Write property test for clamp token validity (Property 12)
    - **Property 12: clamp Token Validity** — for every `clamp(min, preferred, max)` expression
      in `tokens.css`, the constraint `min ≤ preferred ≤ max` holds
    - Use fast-check to parse and validate each clamp expression from the CSS file
    - **Validates: Requirements 1.4**

- [x] 2. Create `css/base.css` — reset, utilities, and global defaults
  - Write a modern CSS reset: `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0 }`
  - Set `html` and `body` defaults: `font-family: var(--font-body)`, background `var(--bg-darkest)`,
    color `var(--text-primary)`, `scroll-behavior: smooth`, `overflow-x: hidden`
  - Add `scrollbar-width: none` / `::-webkit-scrollbar { display: none }` for hidden scrollbar
  - Define selection highlight styles using accent color vars
  - Add utility classes: `.text-accent`, `.text-highlight`, `.sr-only` (screen-reader only),
    `.container` (max-width + `padding: 0 var(--container-px)`)
  - Add `@media (prefers-reduced-motion: reduce)` block: `*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important }`
  - _Requirements: 1.1, 12.1_

- [x] 3. Create `css/layout.css` — structural grid and section scaffolding
  - Define `.story-section`: `position: relative`, `overflow: hidden`, `padding: var(--section-py) 0`
  - Define `.section-header`, `.section-eyebrow`, `.section-title`, `.section-subtitle` styles
    referencing tokens
  - Define `.section-bg` and `.section-bg__orb` positioning and gradient styles
  - Define the `.marquee-strip` and `.marquee-inner` layout (width, overflow hidden, flex)
  - Define `.hero-section` full-viewport layout (`min-height: 100svh`, flex centering)
  - Define `.hero-content`, `.hero-left`, `.hero-right` grid/flex layout
  - Add semantic landmark wrappers: ensure `<main>`, `<header>`, `<footer>` layout is defined
  - _Requirements: 1.1, 12.4_

- [ ] 4. Create `css/components.css` — all UI component styles
  - [x] 4.1 Loading screen component styles
    - `.loading-screen`, `.loading-curtain--left/right`, `.loading-center`, `.loading-brand`,
      `.loading-char`, `.loading-line`, `.loading-line__fill`, `.loading-sub`
    - `.is-done` state: curtain slide-out transform; `.is-hidden` state: `display: none`
    - _Requirements: 3.1, 3.4_

  - [~] 4.2 Navigation component styles
    - `.main-nav`, `.nav-logo`, `.nav-links`, `.nav-link`, `.nav-link__num`, `.nav-link__text`
    - `.is-scrolled` state: glass-blur backdrop (`backdrop-filter: blur(...)`, semi-transparent bg)
    - `.is-hidden` state: `transform: translateY(-100%)`
    - `.is-active` state on `.nav-link`
    - `.scroll-progress`, `.scroll-progress__fill`
    - `.theme-toggle`, `.theme-toggle__track`, `.theme-toggle__thumb`, icon states
    - `.menu-toggle`, `.menu-toggle__line`, `.is-open` state
    - `.mobile-menu`, `.mobile-menu__panel`, `.mobile-menu__backdrop`, `.mobile-link`
    - `.is-open` state for mobile menu panel (translate in)
    - _Requirements: 5.1, 5.2, 5.3, 5.7_

  - [~] 4.3 Hero section component styles
    - `.hero-image__frame`, `.hero-image__mask`, `.hero-image__img`, `.hero-image__border`,
      `.hero-image__glow`, `.hero-badge`, `.hero-badge__pulse`, `.hero-badge__text`
    - `.hero-kicker`, `.hero-kicker__line`, `.hero-kicker__text`
    - `.hero-headline`, `.hero-headline__word`, `.hero-headline__word--accent`
    - `.hero-tagline`, `.hero-metrics`, `.hero-metric`, `.hero-metric__number`,
      `.hero-metric__label`, `.hero-metric__divider`
    - `.hero-cta`, `.btn`, `.btn--primary`, `.btn--ghost`, `.btn--accent`, `.btn--small`,
      `.btn__text`, `.btn__icon`
    - `.hero-scroll-hint`, `.hero-scroll-hint__mouse`, `.hero-scroll-hint__wheel`,
      `.hero-scroll-hint__text`, `.is-scroll-hidden` state
    - `.hero-particles` container, `.hero-vignette`
    - Spotlight effect: `.has-spotlight` state using `--sx`, `--sy` CSS vars and a radial
      gradient overlay
    - _Requirements: 4.1, 9.1_

  - [~] 4.4 Story section card component styles
    - `.origin-card`, `.origin-card__shine`, `.origin-card__icon`, `.origin-card__title`,
      `.origin-card__main`, `.origin-card__sub`, `.origin-card__stat`
    - `.timeline`, `.timeline__track`, `.timeline__line`, `.timeline__progress`,
      `.timeline-entry`, `.timeline-entry__marker`, `.timeline-entry__core`,
      `.timeline-entry__ring`, `.timeline-entry__card`, `.timeline-entry__period`,
      `.timeline-entry__status` (variants: `--done`, `--intern`, `--current`),
      `.timeline-entry__score`, `.timeline-entry__actions`
    - `.project-hero`, `.project-hero__visual`, `.project-hero__orb`, `.project-hero__icon`,
      `.project-hero__meta`, `.project-hero__name`, `.project-hero__hook`, `.project-hero__body`,
      `.project-hero__tech`, `.tech-pill`, `.project-hero__wins`, `.win-badge`,
      `.project-hero__actions`
    - `.project-grid`, `.project-card`, `.project-card__visual`, `.project-card__icon`,
      `.project-card__body`, `.project-card__meta`, `.project-card__tag`, `.project-card__tech`,
      `.project-card__link`
    - `.battle-featured`, `.battle-card`, `.battle-grid`, `.badge`
    - _Requirements: 18.1, 18.2, 18.3_

  - [~] 4.5 Research, credentials, contact, and footer component styles
    - `.research-paper`, `.research-paper__venue`, `.abstract-block`, `.keywords-block`,
      `.kw-tag`, `.results-block`, `.result-card`, `.result-card__fill`,
      `.result-card__number`, `.authors-block`, `.flags-row`, `.flag`, `.paper-actions-row`
    - `.skills-panel`, `.certs-panel`, `.panel-title`, `.skill-group`, `.skill-group__header`,
      `.skill-bar`, `.skill-bar__fill` (base: `width: 0%`)
    - `.cert-item`, `.contact-card`, `.contact-section`
    - Footer styles
    - `.modal` overlay styles (if used for certificate viewing)
    - _Requirements: 10.1_

  - [~] 4.6 Cursor component styles
    - `.cursor`, `.cursor__dot`, `.cursor__ring`, `.cursor__label`
    - `.is-hover` state for dot and ring (scale, opacity changes)
    - `.is-click` state for ring
    - `.ctrail` ghost trail dots (base positioning; size set by JS)
    - Add `body:has(.cursor__dot) { cursor: none }` for desktop custom cursor override
    - _Requirements: 8.1, 8.4_

  - [~] 4.7 Chapter flash and misc overlay styles
    - `#chflash`, `.cf-n`, `.cf-t` positioning and typography styles
    - `[data-theme="light"]` placeholder in `theme.css` (empty for now — populated in task 7)
    - _Requirements: (supports FX layer)_

- [~] 5. Create `css/animations.css` — all keyframes and animation utility classes
  - Define `@keyframes pRise` for hero particle upward float with opacity fade
  - Define `@keyframes marqueeScroll` for infinite horizontal marquee loop (apply to
    `.marquee-inner`; use CSS animation, not JS per-frame)
  - Define `@keyframes loadingBarFill` for the loading progress bar fill (0% → 100%)
  - Define `@keyframes loadingCharReveal` for staggered letter-by-letter brand name reveal
  - Define `@keyframes cursorPulse` for the hero badge pulse ring
  - Define `@keyframes trailFade` if any trail-related CSS animation is needed
  - Add `@media (prefers-reduced-motion: reduce)` block inside this file: set all `[data-reveal]`
    elements to `opacity: 1; transform: none` and suppress all `@keyframes` durations
  - _Requirements: 3.1, 9.2, 9.7, 12.1, 12.2_

- [~] 6. Create `css/responsive.css` — all breakpoint overrides in one file
  - Mobile (`≤ 768px`): single-column hero layout, hide desktop nav links (show mobile toggle),
    hide cursor/trail, disable tilt/magnetic CSS vars, clamp font sizes down, stack timeline
    entries vertically
  - Tablet (`≤ 1024px`, `> 768px`): two-column grids reduce to single column where needed,
    timeline left-aligned only
  - Wide (`≥ 1440px`): increase container max-width, larger hero portrait, wider card grids
  - 4K (`≥ 2560px`): scale up fonts and spacing further, cap max-widths to prevent stretch
  - Ensure NO horizontal scrollbar at any standard viewport width (overflow-x guards)
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.6_

- [ ] 7. Create `css/theme.css` — light theme overrides and print styles
  - [~] 7.1 Implement light theme overrides
    - All overrides scoped to `[data-theme="light"]` selector
    - Override background tokens: `--bg-darkest → #f8f9fa`, `--bg-dark → #ffffff`,
      `--bg-mid → #f1f3f5`, `--bg-card → #ffffff`, etc.
    - Override text tokens: `--text-primary → #1a1a2e`, `--text-secondary → #4a5568`, etc.
    - Override nav glass-blur background to light equivalent
    - Override card backgrounds and borders for light mode
    - _Requirements: 13.1, 13.2_

  - [~] 7.2 Create `css/print.css` — print media styles
    - `@media print` rules: hide `.loading-screen`, `.main-nav`, `#cursor`, `.marquee-strip`,
      `.hero-particles`, `#chflash`, `.ctrail`, scroll progress bar, all animation elements
    - Force `background: white; color: black` for all content
    - Show full URLs after links: `a::after { content: " (" attr(href) ")" }`
    - _Requirements: 17.1, 17.2_

- [~] 8. Checkpoint — CSS architecture complete
  - Verify the 8-file CSS list matches: `tokens.css` → `base.css` → `layout.css` →
    `components.css` → `animations.css` → `responsive.css` → `theme.css` → `print.css`
  - Open `index.html` in browser: confirm no broken styles, no horizontal scroll, dark theme
    renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Create `js/fx.js` — visual effects layer (no GSAP dependency)
  - [x] 9.1 Implement `initMasterRAF()` — single RAF loop for trail + accent lerp
    - Move trail dot creation logic from `effects.js`: build 8 ghost dots on non-coarse devices
      (`window.matchMedia('(pointer:coarse)').matches`), each sized `Math.max(2, 6 - i * 0.5)px`
    - Implement trail lerp with speed `0.40 - i * 0.028` per dot toward previous dot / mouse pos
    - Implement accent lerp: factor `L = 0.03`, terminate when `|delta| ≤ 0.3` for all channels;
      write `--ar`, `--ag`, `--ab` to `:root` only when any channel changed
    - Merge both into single `requestAnimationFrame` tick — no separate loops
    - Export `accentTarget` as module-level array so `initSectionColors()` can write to it
    - Guard: on coarse-pointer devices, skip trail creation and trail step in tick entirely
    - _Requirements: 7.2, 7.3, 8.2, 8.3, 8.5, 15.1_

  - [x] 9.2 Write property test for accent color convergence (Property 4)
    - **Property 4: Accent Color Convergence** — for all `(start, target)` pairs in `[0,255]³`,
      after 500 RAF frames, `|accentCurr[i] - accentTarget[i]| ≤ 0.3` for all channels
    - Use fast-check `fc.tuple(fc.integer({min:0,max:255}), ...)` to generate arbitrary pairs
    - **Validates: Requirements 7.2, 7.3, 7.4**

  - [x] 9.3 Implement `initSectionColors()` — scroll-based accent target updates
    - Define `SECTION_COLOR_MAP` with all 8 entries: `prologue`, `origin`, `journey`, `quests`,
      `battles`, `discovery`, `credentials`, `contact`
    - Use `ScrollTrigger.create` on each `.story-section[id]` with `start: 'top 55%'`;
      set `accentTarget` on `onEnter` and `onEnterBack`
    - Note: this function uses ScrollTrigger — call it only after GSAP is confirmed available
    - _Requirements: 7.1, 7.5_

  - [x] 9.4 Implement `initSpotlight()` — hero spotlight effect
    - Wire `mousemove` on `.hero-section` (with `{ passive: true }`) to update CSS vars
      `--sx` and `--sy` as percentages; add/remove `.has-spotlight` class on enter/leave
    - _Requirements: 9.1_

  - [x] 9.5 Implement `initMarquee()` — CSS-animated marquee strips
    - Inject 6 marquee strips after: `#origin`, `#journey`, `#quests`, `#battles`,
      `#discovery`, `#credentials`
    - Each strip: `.marquee-strip` > `.marquee-inner` with repeated spans
    - Duplicate count: `Math.max(30, Math.ceil(window.innerWidth / 40))` — handles 4K screens
    - Add a debounced `resize` listener to rebuild inner content on viewport change
    - Apply `will-change: transform` only to `.marquee-inner` (per performance requirement)
    - _Requirements: 9.2, 15.5_

  - [x] 9.6 Implement `initGlitch()` — section eyebrow text scramble
    - Wire `mouseenter` on each `.section-eyebrow`: start `setInterval` at 28ms
    - Each tick: compute `revealed = Math.floor((f / total) × orig.length)`; for each char,
      if `i < revealed` use original char, if `c === ' '` preserve space, else random char from
      `'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'`
    - On `mouseleave`: clear interval immediately, restore `element.textContent = orig`
    - When `f ≥ total`: restore `element.textContent = orig`, `clearInterval`
    - Store original text as `data-orig` attribute on first interaction
    - Also use `IntersectionObserver` (threshold 0.5) to auto-trigger once when entering viewport
    - _Requirements: 9.3, 9.4, 9.5, 9.6_

  - [x] 9.7 Write property test for glitch restoration guarantee (Property 10)
    - **Property 10: Glitch Restoration Guarantee** — for any `textContent` string, after the
      interval completes (`f ≥ total`), `element.textContent === orig`; and for any frame `f`,
      all chars at index `< Math.floor((f/total) × orig.length)` are the original characters
    - Use fast-check to generate arbitrary strings and simulate the scramble loop
    - **Validates: Requirements 9.3, 9.4, 9.6**

  - [-] 9.8 Implement `initParticles()` — CSS keyframe hero particles
    - Read `window.innerWidth < 768 ? 12 : 25` for particle count (req. 11.5 specifies 12/25)
    - Create `<span>` elements with randomised `left`, `width`/`height`, `animation-duration`,
      `animation-delay`, color (accent or purple), and opacity
    - Set `animation: pRise ${dur}s linear ${del}s infinite` via inline style
    - Append to `#heroParticles`; add zero JS per animation frame
    - _Requirements: 9.7, 11.5_

  - [-] 9.9 Implement `initTilt()` — 3D card tilt (desktop only)
    - Guard: `if (window.matchMedia('(pointer:coarse)').matches) return`
    - Guard: `if (typeof VanillaTilt === 'undefined') return`
    - Apply `VanillaTilt.init()` separately on `.origin-card` (max:10), `.project-card`
      (max:8), `.battle-card` (max:6) with `glare: false, gyroscope: false`
    - _Requirements: 9.8, 11.1_

  - [-] 9.10 Implement `initMagnetic()` — magnetic CTA button attraction (desktop only)
    - Guard: `if (window.matchMedia('(pointer:coarse)').matches) return`
    - Wire `mousemove` on `.btn--primary, .btn--accent`: compute offset from center × 0.25,
      apply `translate(Xpx, Ypx)` via inline style; `{ passive: true }`
    - On `mouseleave`: animate back to `transform: ''` with cubic-bezier transition then clear
    - _Requirements: 9.9, 11.1_

  - [-] 9.11 Implement `initChapterFlash()` — full-screen chapter overlay
    - Create `#chflash` element with `.cf-n` and `.cf-t` children, append to body
    - Use `ScrollTrigger.create` with `IntersectionObserver` fallback for each of the 7 chapters
    - Flash fires with 1800ms cooldown; uses GSAP timeline: set visible → opacity 1 → opacity 0
      → hide
    - _Requirements: (supports cinematic narrative)_

  - [~] 9.12 Implement `fx.boot()` entry point
    - Export a `boot()` function that calls all init functions in order:
      `initMasterRAF`, `initSectionColors`, `initSpotlight`, `initMarquee`, `initGlitch`,
      `initParticles`, `initTilt`, `initMagnetic`, `initChapterFlash`
    - Must not require GSAP to be defined to call `initMasterRAF`, `initSpotlight`,
      `initMarquee`, `initGlitch`, `initParticles`, `initTilt`, `initMagnetic`
    - `initSectionColors` and `initChapterFlash` use ScrollTrigger — guard with
      `typeof ScrollTrigger !== 'undefined'`
    - _Requirements: 2.3_

  - [~] 9.13 Write property test for mobile coarse-pointer guard (Property 7)
    - **Property 7: Mobile Coarse-Pointer Guard** — when `matchMedia('(pointer:coarse)')` returns
      true, no trail dots are created and the RAF trail branch is skipped for any combination of
      viewport size
    - Mock `window.matchMedia` in jsdom and assert no `.ctrail` elements in `document.body`
    - **Validates: Requirements 8.3**

- [~] 10. Checkpoint — FX layer complete
  - Verify trail, spotlight, marquee, glitch, particles, tilt, and magnetic effects all work
  - Verify a single RAF loop is running (check DevTools Performance — no duplicate animation
    frame callbacks)
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 11. Create `js/engine.js` — boot lifecycle and GSAP-dependent features
  - [x] 11.1 Implement `applyStoredTheme()` and theme persistence
    - Read `localStorage.getItem('yoge-theme')` in `applyStoredTheme()` wrapped in `try/catch`
    - On success: call `document.documentElement.setAttribute('data-theme', theme)` if non-null
    - On exception: default to dark (no-op — dark is the default `data-theme` state)
    - Wire `#themeToggle` click listener: toggle `data-theme` between `'dark'` and `'light'`,
      then persist with `localStorage.setItem('yoge-theme', next)` in `try/catch`
    - _Requirements: 5.9, 5.10, 13.3, 13.4, 13.5, 14.4_

  - [x] 11.2 Write property test for theme toggle round-trip (Property 6)
    - **Property 6: Theme Toggle Round-Trip** — toggling the theme twice returns `data-theme` to
      its original value; after each toggle, `localStorage.getItem('yoge-theme')` equals the
      current `data-theme`
    - Use fast-check to generate arbitrary initial theme values (`'dark'` | `'light'`)
    - **Validates: Requirements 5.9, 5.10, 13.1, 13.2**

  - [-] 11.3 Implement `initCursor()` — custom cursor (desktop only)
    - Guard: `if (window.matchMedia('(pointer:coarse)').matches) return`
    - Wire `mousemove` with `{ passive: true }`: move `.cursor__dot` instantly to `(mx, my)` via
      transform; run a separate internal RAF loop for `.cursor__ring` lerp (factor 0.10)
    - Handle `mousedown`/`mouseup` for `.is-click` on ring
    - Handle `mouseleave` from `document` to set opacity to 0
    - Add `mouseenter`/`mouseleave` on `'a,button,.btn,.origin-card,.project-card,.battle-card'`
      for `.is-hover` state on dot and ring
    - _Requirements: 8.1, 8.4_

  - [~] 11.4 Implement `initLoading()` — loading screen dismiss lifecycle
    - Capture `t0 = Date.now()` and `MIN = 1600`, `HARD_TIMEOUT = 4000`
    - Define `dismiss()` guarded by `screen.dataset.done` check (return immediately if set)
    - Set `screen.dataset.done = '1'` atomically before any side effects
    - `dismiss()`: add `.is-done` → wait 900ms → add `.is-hidden` → call `heroEntry()` exactly once
    - Register `window.addEventListener('load', ...)` to call `setTimeout(dismiss, Math.max(0, MIN - elapsed))`
    - Register `setTimeout(dismiss, HARD_TIMEOUT)` as safety net
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [~] 11.5 Write property test for loading dismissal idempotency (Property 3)
    - **Property 3: Loading Dismissal Idempotency** — calling `dismiss()` any number of times
      results in `heroEntry()` being called exactly once; subsequent calls return immediately
    - Mock `document.getElementById` and `heroEntry` in jsdom; call `dismiss()` 1–10 times
    - Use fast-check `fc.integer({min:1, max:10})` to generate call counts
    - **Validates: Requirements 3.5, 3.6**

  - [~] 11.6 Implement `heroEntry()` — cinematic hero reveal timeline
    - Guard entire function: `if (typeof gsap === 'undefined') { /* add fallback class */ return; }`
    - Build GSAP timeline with `defaults: { ease: 'power3.out' }` and add all 10 fromTo
      animations per the design spec (portrait mask, image scale, border, glow, badge, kicker,
      headline, tagline, metrics, CTA, scroll-hint)
    - Animate portrait mask: `clipPath: 'inset(100% 0 0 0)' → 'inset(0% 0 0 0)'` over 1.2s at t=0
    - Counter animation: iterate `[data-count]` elements, animate from 0 to `parseInt(dataset.count)`
      over 2s with `ease: 'power2.out'`, starting at t=1.0
    - Register hero scroll-hint fade ScrollTrigger: `start: '5% top', end: '18% top', scrub: true,
      once: false`; use `onLeave`/`onEnterBack` to toggle `.is-scroll-hidden`
    - Register desktop-only parallax ScrollTriggers for `.hero-image__frame` and text elements
      (guard: `if (!tab())`)
    - Call `initTyped()` to start Typed.js typewriter
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 14.2_

  - [~] 11.7 Implement `initTyped()` — Typed.js role typewriter
    - Guard: `if (!el || typeof Typed === 'undefined') return`
    - Configure with 5 role strings, `typeSpeed: 42`, `backSpeed: 32`, `backDelay: 1800`,
      `startDelay: 600`, `loop: true`, `smartBackspace: false`, `cursorChar: '|'`
    - _Requirements: 4.4, 14.3_

  - [~] 11.8 Implement `initNav()` — navigation scrollspy, progress bar, mobile menu
    - Scroll listener (`{ passive: true }`): toggle `.is-scrolled` on `.main-nav` when
      `scrollY > 50`; detect scroll direction (compare to last `scrollY`) and toggle
      `.is-hidden` on nav accordingly
    - Scroll progress: `width = Math.min(100, scrollY / (scrollHeight - innerHeight) * 100) + '%'`
      on `.scroll-progress__fill`; initial call after 3200ms
    - Scrollspy `updateScrollspy()`: iterate `.story-section[id]` elements, find last section
      where `offsetTop ≤ scrollY + 110`, remove `.is-active` from all links, add to matching
      link; call once after 400ms for initial state
    - Smooth scroll: `.nav-link[href^="#"]` click → `element.scrollIntoView({ behavior: 'smooth' })`
    - Mobile menu: toggle `.is-open` on `#mobileMenu` and `#menuToggle` on toggle click;
      close on backdrop click, close button click, or mobile link click (with 300ms delay for
      scroll); set `document.body.style.overflow` accordingly
    - Theme toggle: wire `#themeToggle` click → delegate to `applyStoredTheme` toggle logic
    - Logo click: smooth scroll to top
    - `.top-button` click: smooth scroll to top
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.11_

  - [~] 11.9 Write property test for scrollspy at-most-one-active (Property 5)
    - **Property 5: Scrollspy At-Most-One-Active** — for any `scrollY` and any array of sections
      with distinct `offsetTop` values, `updateScrollspy()` results in at most one `.nav-link`
      having `.is-active`; the active link matches the deepest section with `offsetTop ≤ scrollY + 110`
    - Extract `computeActiveSection()` as a pure function; test with fast-check arbitrary arrays
    - **Validates: Requirements 5.4, 5.5**

  - [~] 11.10 Write property test for scroll progress bar accuracy (Property 11)
    - **Property 11: Scroll Progress Bar Accuracy** — for any `scrollY` and page dimensions, the
      computed progress percentage equals `clamp(scrollY / (docHeight - vpHeight) × 100, 0, 100)`
    - Test the pure computation function with fast-check for boundary cases (0, max, over-max)
    - **Validates: Requirements 5.3**

  - [~] 11.11 Implement `initScrollScenes()` — all GSAP scroll-triggered entrance animations
    - Set `ScrollTrigger.defaults({ once: true, fastScrollEnd: true, preventOverlaps: true })`
    - Section headers: wipe clip-path reveal; guard with `getBoundingClientRect().top < innerHeight`
      to immediately set final state for in-viewport elements
    - Section eyebrows: fade + letter-spacing reveal (same in-viewport guard)
    - Section subtitles: fade + y reveal (same guard)
    - Origin: narrative blocks fly in from x:-50; origin cards 3D throw-in with `back.out(1.3)`
    - Journey: timeline progress scrub (`start: 'top 65%', end: 'bottom 35%', scrub: 1`);
      timeline entries alternate x: -65 / +65 based on even/odd index; markers scale in
    - Quests: project hero zoom from depth; icon spin; tech pills stagger; project cards
      with alternating rotation ±6deg
    - Battles: featured card slams from x:-80; battle cards stagger from x:70; badge chips scatter
    - Discovery: research paper rises; sub-blocks stagger; result cards pop; keyword tags scatter;
      flags fly in
    - Credentials: skills panel slides from x:-80; skill group headers stagger; certs panel drops
      from y:-60; cert items stagger from x:55
    - Contact: contact cards cascade up from y:50
    - Desktop-only (`!mob()`): parallax scrub on `.section-bg__orb` and on project/battle/origin
      cards
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 14.5_

  - [~] 11.12 Write property test for single animation entry (Property 1)
    - **Property 1: Single Animation Entry** — for any set of scroll positions visited in any
      order, no entrance animation plays more than once (ScrollTrigger `once: true`)
    - Mock ScrollTrigger registration; verify each element's animation fires exactly once
    - **Validates: Requirements 6.1**

  - [~] 11.13 Write property test for in-viewport visibility guarantee (Property 2)
    - **Property 2: In-Viewport Visibility Guarantee** — for any `.section-title` or
      `[data-reveal]` element whose `getBoundingClientRect().top < window.innerHeight`, the
      element is immediately set to `opacity: 1; transform: none` via `gsap.set()`
    - Mock `getBoundingClientRect` to return various top values and assert correct branching
    - **Validates: Requirements 6.2**

  - [~] 11.14 Implement `initSkillBars()` — scroll-triggered skill bar animations
    - For each `.skill-bar__fill`: set `bar.style.width = '0%'`
    - Create `IntersectionObserver` (threshold 0.3) that animates width to `data-width + '%'`
      using GSAP (`duration: 1.6, ease: 'power3.out'`) then calls `observer.disconnect()`
    - _Requirements: 10.1, 10.2, 10.3_

  - [~] 11.15 Write property test for skill bar observer teardown (Property 9)
    - **Property 9: Skill Bar Observer Teardown** — for any number of `.skill-bar__fill` elements,
      each observer calls `disconnect()` after its first intersection; no bar animates more than
      once regardless of repeated viewport entries
    - Mock IntersectionObserver in jsdom; fire the callback multiple times; assert animation runs
      only once
    - **Validates: Requirements 10.1, 10.2, 10.3**

  - [~] 11.16 Implement `initResultCards()` — result card bar + counter animations
    - Parse target width from existing inline `style` attribute before removing it
    - Parse target numeric value from `data-count` or `textContent`
    - Use `IntersectionObserver` (threshold 0.05) with `fired` flag guard to animate once:
      `gsap.fromTo(fill, { width: '0%' }, { width: targetW + '%', ... })`
    - Animate counter with `gsap.to(obj, { v: targetN, onUpdate: ... })`
    - _Requirements: (supports Discovery section)_

  - [~] 11.17 Implement `boot()` entry point for `engine.js`
    - Call `applyStoredTheme()` first (Phase 0)
    - Call `fx.boot()` (Phase 1)
    - Call `initCursor()`, `initLoading()`, `initNav()`, `initScrollScenes()`,
      `initSkillBars()`, `initResultCards()` (Phase 2)
    - Trigger via `document.readyState === 'loading' ? addEventListener('DOMContentLoaded', boot) : boot()`
    - _Requirements: 2.1, 2.2, 2.5_

- [~] 12. Checkpoint — JS engine complete
  - Load page: verify loading screen dismisses within 4s, hero entry plays, nav scrollspy works
  - Scroll through all 7 sections: verify entrance animations fire once each, no element stuck
    at opacity:0, chapter flash triggers, accent color transitions between sections
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Rewrite `index.html` — semantic, accessible, production-ready markup
  - [~] 13.1 Update `<head>` with new CSS load order and inline theme script
    - Replace all 25 CSS `<link>` tags with the 8 new CSS files in exact dependency order:
      `tokens.css` → `base.css` → `layout.css` → `components.css` → `animations.css` →
      `responsive.css` → `theme.css` → `print.css` (print with `media="print"`)
    - Ensure the inline `<head>` `<script>` for theme reads `localStorage('yoge-theme')` and sets
      `data-theme` before first CSS paint, wrapped in `try/catch`
    - Add `<link rel="preconnect">` hints for Google Fonts with `crossorigin` attribute
    - Load Google Fonts with `&display=swap` parameter
    - Replace `<script>` tags for old JS files with `<script src="js/fx.js" defer>` and
      `<script src="js/engine.js" defer>` (engine loaded after fx)
    - Add CDN `<script>` tags for GSAP, ScrollTrigger, VanillaTilt, Typed.js before engine.js
    - Add Font Awesome CDN `<script>` tag
    - Add `integrity` and `crossorigin="anonymous"` SRI attributes on all CDN resources where
      available (Req. 16.3)
    - _Requirements: 1.1, 1.6, 2.1, 5.11, 13.3, 15.3, 16.3_

  - [~] 13.2 Add semantic landmark structure and ARIA attributes
    - Wrap the loading screen in a `<div aria-hidden="true">` (decorative, not landmark)
    - Wrap nav in `<header>` containing `<nav aria-label="Primary navigation">`
    - Wrap all story sections in `<main>`
    - Wrap the footer in `<footer>`
    - Add `role="progressbar"` and `aria-valuenow` on `.scroll-progress`
    - Add `aria-expanded` on `#menuToggle` that reflects mobile menu state (update in JS)
    - Add `aria-label` to all icon-only buttons and Font Awesome icons used as interactive elements
    - Add `alt` text to all non-decorative `<img>` elements; add `aria-hidden="true"` to
      purely decorative images/icons
    - Add `rel="noopener noreferrer"` to every `<a target="_blank">` link
    - Add `download` attribute to all certificate PDF/image anchor tags
    - _Requirements: 12.3, 12.4, 12.5, 12.6, 16.1, 16.2_

  - [~] 13.3 Update hero section markup
    - Ensure `<img>` has `loading="eager"` and `onerror` fallback to `assets/hero-portrait.svg`
    - Verify `data-count` attributes are present on all `.hero-metric__number` elements
    - Verify `id="typed-role"` span exists inside `.hero-kicker__text`
    - Verify `id="heroParticles"` div exists
    - Verify scroll hint markup is present with correct class names
    - _Requirements: 4.1, 14.1, 15.2_

  - [~] 13.4 Update story section `data-section` attributes and structure
    - Verify each `<section>` has the correct `id`, `class="story-section [name]-section"`,
      and `data-section="N"` attribute (0 = prologue, 1 = origin, … 7 = contact)
    - Verify `#loadingScreen` element and all `.loading-char[data-delay]` spans exist
    - Verify `#cursor`, `.cursor__dot`, `.cursor__ring` elements exist in DOM
    - Ensure every `.skill-bar__fill` has a valid integer `data-width` attribute (0–100)
    - _Requirements: 18.4_

- [ ] 14. Implement accessibility and reduced-motion compliance
  - [~] 14.1 Implement reduced-motion CSS overrides
    - In `animations.css`, add comprehensive `@media (prefers-reduced-motion: reduce)` block:
      all `[data-reveal]` elements: `opacity: 1 !important; transform: none !important`
      all animated elements (`.loading-char`, `.marquee-inner`, `.ctrail`, `.hero-particles span`):
      `animation: none !important; transition: none !important`
    - _Requirements: 12.1, 12.2_

  - [~] 14.2 Verify WCAG 2.1 AA color contrast compliance
    - Check text color pairs against token values: `--text-primary` on `--bg-card` (4.5:1 min for
      normal text), `--text-secondary` on dark backgrounds, all interactive element labels
    - Adjust token values in `tokens.css` if any pair fails the 4.5:1 ratio for normal text or
      3:1 for large text/UI components
    - Check light theme overrides in `theme.css` for the same pairs
    - _Requirements: 12.3_

  - [~] 14.3 Add visible keyboard focus indicators
    - Add `:focus-visible` styles in `components.css` for all interactive elements (`.nav-link`,
      `.btn`, `.theme-toggle`, `.menu-toggle`, `.project-card__link`, `.mobile-link`,
      `.timeline-entry__actions a`)
    - Ensure focus ring is visible in both dark and light themes
    - Ensure focus does not disappear when custom cursor is active
    - _Requirements: 12.3_

- [~] 15. Checkpoint — Accessibility audit
  - Verify reduced-motion: set `prefers-reduced-motion: reduce` in OS/browser and confirm all
    animated elements are immediately visible
  - Verify keyboard navigation: tab through all interactive elements, confirm focus is always
    visible
  - Test with a screen reader or axe DevTools: confirm semantic landmarks, ARIA labels, and
    alt text are all present
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Performance hardening and security review
  - [~] 16.1 Audit `will-change` usage and passive listeners
    - In `components.css`/`animations.css`: verify `will-change: transform` is applied ONLY to
      `.ctrail` (trail dots) and `.marquee-inner`; remove it from any card or tilt element
    - Verify all `scroll`, `mousemove`, `resize`, `touchmove` event listeners across both JS
      files use `{ passive: true }`
    - _Requirements: 15.4, 15.5_

  - [~] 16.2 Implement image loading attributes and font preloads
    - In `index.html`: confirm hero `<img>` has `loading="eager"`, all below-fold `<img>` tags
      have `loading="lazy"`
    - Confirm `<link rel="preconnect">` for Google Fonts CDN exists with `crossorigin`
    - Confirm Google Fonts URL includes `&display=swap`
    - _Requirements: 15.2, 15.3_

  - [~] 16.3 Register all ScrollTrigger animations with `once: true`
    - Audit `initScrollScenes()`: confirm every `ScrollTrigger` registration that triggers an
      entrance animation includes `once: true` (the global default handles most; verify any
      inline overrides don't accidentally set `once: false`)
    - Exception: hero scroll-hint fade uses `once: false` intentionally (bidirectional)
    - _Requirements: 15.6_

  - [~] 16.4 Security audit on external links and CDN integrity
    - Audit `index.html`: every `<a target="_blank">` must have `rel="noopener noreferrer"`
    - Every certificate PDF/image link must have `download` attribute
    - Every CDN `<script>` and CDN `<link>` tag must have `integrity` (SRI) and
      `crossorigin="anonymous"` attributes where hash is available
    - _Requirements: 16.1, 16.2, 16.3_

- [~] 17. Remove legacy CSS files and update all cross-references
  - Delete the original 25 CSS files: `loading.css`, `nav.css`, `hero.css`, `origin.css`,
    `journey.css`, `quests.css`, `battles.css`, `discovery.css`, `credentials.css`,
    `contact.css`, `modal.css`, `animations.css` (old), `advanced-animations.css`,
    `transitions-enhanced.css`, `effects.css`, `responsive.css` (old), `ultra-wide.css`,
    `ultra-small.css`, `cinematic.css`, `premium.css`, `visibility-fix.css`,
    `4k-overrides.css`, `print.css` (old), `base.css` (old), `theme.css` (old)
  - Delete the original JS files: `js/effects.js` and `js/story.js`
  - Remove any remaining `<link>` tags or `<script>` tags in `index.html` that reference
    deleted files
  - Verify `index.html` only loads the 8 CSS files and 2 JS files (plus CDN scripts)
  - _Requirements: 1.1, 2.1_

- [~] 18. Final integration checkpoint
  - Full end-to-end visual review: load site in Chrome/Firefox/Safari on desktop and mobile
  - Test all interactive paths: loading screen → hero entry → all section scroll animations →
    nav scrollspy → mobile menu → theme toggle → skill bars → result card animations
  - Test error resilience: block CDN scripts and confirm GSAP-unavailable fallbacks work;
    block `image.jpg` and confirm SVG fallback renders
  - Test private-browsing mode: confirm theme toggle degrades gracefully when localStorage
    throws
  - Verify no horizontal scroll at 375px, 768px, 1024px, 1440px, 2560px viewport widths
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster initial implementation
- Each property-based test task references a specific correctness property from the design doc
- Property tests use **fast-check** as the PBT library: `npm install --save-dev fast-check`
- Unit tests can use Jest or Vitest with jsdom for DOM mocking
- The design uses **vanilla JavaScript** throughout — no build step or bundler is required
- CSS must be written in the exact 8-file load order; `tokens.css` must be loaded first or
  all `var(--token-name)` references will fall back to initial values
- The `once: false` exception on the hero scroll-hint ScrollTrigger is intentional — it must
  allow the hint to reappear when the user scrolls back to the top

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["9.1", "9.2", "11.1", "11.2"] },
    { "id": 2, "tasks": ["9.3", "9.4", "9.5", "9.6", "9.7", "9.8", "9.9", "9.10", "9.11", "11.3", "11.4", "11.5"] },
    { "id": 3, "tasks": ["9.12", "9.13", "11.6", "11.7", "11.8", "11.9", "11.10"] },
    { "id": 4, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "11.11", "11.12", "11.13", "11.14", "11.15", "11.16"] },
    { "id": 5, "tasks": ["7.1", "7.2", "11.17", "13.1", "13.2", "13.3", "13.4"] },
    { "id": 6, "tasks": ["14.1", "14.2", "14.3", "16.1", "16.2", "16.3", "16.4"] }
  ]
}
```
