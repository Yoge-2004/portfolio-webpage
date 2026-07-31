# Requirements Document

## Introduction

This document specifies the functional and non-functional requirements for the complete technical
redesign of Yogeshwaran M's personal portfolio site (yoge.dev). The redesign maintains the
existing cinematic, chapter-based narrative experience while replacing the fragmented 25-file CSS
architecture with a token-driven design system, consolidating two JavaScript files into a single
modular engine, and achieving WCAG 2.1 AA accessibility compliance. The output remains a
zero-dependency static site (vanilla HTML + CSS + JavaScript), with GSAP and a small number of
declarative CDN libraries for animation support.

---

## Glossary

- **Site**: The static portfolio website hosted at yoge.dev.
- **Engine**: The JavaScript module (`engine.js`) responsible for boot lifecycle, navigation,
  loading screen management, and scroll-scene registration.
- **FX_Layer**: The JavaScript module (`fx.js`) responsible for visual effects — cursor trail,
  accent color lerp, marquee strips, glitch animation, particles, tilt, magnetic buttons, and
  spotlight — that operate independently of the GSAP dependency.
- **Loading_Screen**: The full-viewport entry curtain displayed on first paint (`#loadingScreen`).
- **Hero_Section**: The full-viewport opening section of the page containing the portrait,
  animated name, role typewriter, metric counters, and call-to-action buttons.
- **Nav**: The fixed top navigation bar with scrollspy, theme toggle, progress bar, and mobile
  drawer (`#mainNav`).
- **Story_Section**: One of the seven narrative chapter sections: Origin, Journey, Quests,
  Battles, Discovery, Credentials, and Contact.
- **ScrollTrigger**: The GSAP plugin managing scroll-driven animation triggers.
- **Accent_Color_System**: The runtime system that lerps `accentCurr` toward `accentTarget` each
  animation frame and writes the result to the CSS custom properties `--ar`, `--ag`, `--ab`.
- **Design_Token**: A CSS custom property defined in `tokens.css` that encodes a single design
  decision (color, spacing, easing, typography).
- **Trail_System**: The cursor ghost trail consisting of 8 dots rendered on desktop devices only.
- **Glitch_Animator**: The text-scramble effect applied to `.section-eyebrow` elements on
  intersection and hover.
- **Skill_Bar**: An animated progress bar in the Credentials section driven by a `data-width`
  attribute and an `IntersectionObserver`.
- **Theme_Toggle**: The UI control that switches between dark and light visual themes and persists
  the preference to `localStorage`.
- **GSAP**: GreenSock Animation Platform v3, used for timeline and scroll-driven animations.
- **RAF**: `requestAnimationFrame` — the browser's animation frame callback mechanism.

---

## Requirements

### Requirement 1: CSS Architecture Consolidation

**User Story:** As a developer, I want the CSS restructured into a token-driven, layered system,
so that styles are maintainable, override-free, and consistently applied across all sections.

#### Acceptance Criteria

1. THE Site SHALL organise all CSS into exactly eight files loaded in dependency order:
   `tokens.css` → `base.css` → `layout.css` → `components.css` → `animations.css` →
   `responsive.css` → `theme.css` → `print.css`.
2. THE Site SHALL define all design decisions — colors, spacing, easing curves, typography
   scale, breakpoints, shadow values, border-radius values, z-index layers, and transition
   durations — exclusively as CSS custom properties in `tokens.css`; no hard-coded literal
   values for these categories SHALL appear in any other CSS file.
3. IF a Design_Token value is referenced in any CSS file other than `tokens.css`, THEN THE
   Site SHALL reference it via `var(--token-name)` rather than a hard-coded literal value.
4. THE Site SHALL define fluid spacing values using `clamp(min, preferred, max)` expressions
   where all three operands satisfy `min ≤ preferred ≤ max`.
5. WHEN the page begins loading and before the first CSS paint, THE Site SHALL expose dynamic
   accent color as three integer CSS custom properties — `--ar`, `--ag`, `--ab` — each in the
   range 0–255 on `:root`, set at runtime by the Accent_Color_System.
6. IF the `tokens.css` file is not loaded first, THEN any `var(--token-name)` reference in
   subsequent CSS files SHALL resolve to its declared fallback value, making load order a
   deployment correctness constraint with a detectable visual regression.
7. IF a `var(--token-name)` reference has no corresponding property declaration in `tokens.css`,
   THEN THE Site SHALL resolve it to an explicitly declared fallback value rather than the
   browser's initial value for that property.

---

### Requirement 2: JavaScript Engine Architecture

**User Story:** As a developer, I want JavaScript consolidated into two modules with a clear
lifecycle, so that the codebase is understandable, testable, and free of race conditions.

#### Acceptance Criteria

1. IF `document.readyState` is `'interactive'` or `'complete'` when `engine.js` is evaluated,
   THEN THE Engine SHALL call `boot()` immediately; WHEN the `DOMContentLoaded` event fires
   while `document.readyState` is `'loading'`, THE Engine SHALL call `boot()` at that point.
2. WHEN `boot()` is called, THE Engine SHALL execute initialisation in the following phase order,
   completing each phase fully before starting the next: (Phase 0) `applyStoredTheme()`; (Phase
   1) `fx.boot()`; (Phase 2) `initCursor()`, `initLoading()`, `initNav()`, `initScrollScenes()`.
3. THE FX_Layer SHALL initialise the following effects without requiring GSAP to be loaded:
   `initMasterRAF`, `initSpotlight`, `initMarquee`, `initGlitch`, `initParticles`, `initTilt`,
   `initMagnetic`; effects that use ScrollTrigger (`initSectionColors`, `initChapterFlash`)
   SHALL be guarded with `typeof ScrollTrigger !== 'undefined'` before calling them.
4. THE Engine SHALL call `boot()` at most once per page load, enforced by a boolean guard set
   before any initialisation side effects run.
5. IF `typeof gsap === 'undefined'` at the time of any GSAP call, THEN THE Engine SHALL add
   the class `.is-ready` to `document.documentElement` to expose all animated elements in their
   final visible state, without throwing an unhandled exception.
6. WHEN `boot()` has completed, THE Engine SHALL have all interactive elements in
   `'a, button, .btn, .origin-card, .project-card, .battle-card'` responding to pointer events
   and all ScrollTrigger scroll animations registered.

---

### Requirement 3: Loading Screen

**User Story:** As a visitor, I want the loading screen to display a cinematic entry animation
and then dismiss itself reliably, so that I reach the hero section without a stuck or blank screen.

#### Acceptance Criteria

1. WHEN the page first loads, THE Loading_Screen SHALL occupy the full viewport, display a
   letter-by-letter brand name animation that completes within `1500 ms`, and animate a linear
   progress bar fill from `0 %` to `100 %` over that same period.
2. WHEN the `window.load` event fires, THE Loading_Screen SHALL wait for the greater of
   `1600 ms` from the page navigation start timestamp and the actual elapsed time before calling
   `dismiss()`.
3. IF the `window.load` event has not fired within `4000 ms` of the page navigation start
   timestamp, THEN THE Loading_Screen SHALL call `dismiss()` regardless to prevent a
   permanently stuck screen.
4. WHEN `dismiss()` is called, THE Loading_Screen SHALL add the `.is-done` class, wait `900 ms`
   for the curtain animation, then add the `.is-hidden` class.
5. WHEN `.is-hidden` is added to the Loading_Screen, THE Loading_Screen SHALL call `heroEntry()`
   exactly once immediately afterward.
6. IF `dismiss()` is called a second time, THEN THE Loading_Screen SHALL return immediately
   without executing any dismissal logic or calling `heroEntry()` again.

---

### Requirement 4: Hero Section Animation

**User Story:** As a visitor, I want the hero section to reveal itself with a cinematic
timeline after the loading screen dismisses, so that the first impression is visually compelling.

#### Acceptance Criteria

1. WHEN `heroEntry()` is called, THE Hero_Section SHALL animate the portrait reveal, text
   content, metrics, and call-to-action buttons in a sequenced GSAP timeline using
   `ease: 'power3.out'`.
2. WHEN the hero entry timeline plays, THE Hero_Section SHALL animate the portrait mask from
   `clipPath: inset(100% 0 0 0)` to `inset(0% 0 0 0)` over `1.2 s` starting at `t = 0`.
3. WHEN the hero entry timeline plays, THE Hero_Section SHALL animate each `[data-count]`
   element's numeric text from `0` to its `data-count` integer value over `2 s` using
   `ease: 'power2.out'`, starting at `t = 1.0 s`.
4. WHEN `heroEntry()` completes, THE Hero_Section SHALL call `initTyped()` to start the
   Typed.js role typewriter cycling.
5. WHEN `heroEntry()` is called with GSAP unavailable, THE Hero_Section SHALL make all `.hero-*`
   elements immediately visible by adding a fallback CSS class.
6. WHILE the user has not scrolled, THE Hero_Section SHALL display a scroll-hint indicator.
7. WHEN the user scrolls past `18 %` of the hero section height, THE Hero_Section SHALL hide
   the scroll-hint indicator.
8. WHERE the viewport is wider than the tablet breakpoint (`> 1024 px`), THE Hero_Section SHALL
   register a ScrollTrigger parallax effect on the portrait and text elements.

---

### Requirement 5: Navigation

**User Story:** As a visitor, I want the navigation bar to always reflect my current position
and offer theme switching, so that I can quickly jump to any section and personalise my experience.

#### Acceptance Criteria

1. WHEN the user scrolls more than `50 px` from the top, THE Nav SHALL add the `.is-scrolled`
   class to apply a glass-blur backdrop.
2. WHEN the user's scroll delta is greater than `10 px` downward in a single scroll event, THE
   Nav SHALL add the `.is-hidden` class to hide itself; WHEN the user scrolls upward in any
   amount, THE Nav SHALL remove `.is-hidden`.
3. WHEN the user scrolls, THE Nav SHALL update the scroll progress bar fill width to
   `Math.min(100, scrollY / (documentScrollHeight − viewportHeight) × 100) %`.
4. WHEN the user scrolls, THE Nav SHALL activate the `.nav-link` corresponding to the deepest
   Story_Section whose `offsetTop` is ≤ `scrollY + 110 px`.
5. THE Nav SHALL ensure that at most one `.nav-link` carries the `.is-active` class at any time.
6. WHEN the user clicks a `.nav-link`, THE Nav SHALL smooth-scroll the viewport to the target
   section.
7. WHEN the user clicks the mobile menu toggle on viewports `≤ 768 px`, THE Nav SHALL open the
   full-panel mobile drawer with a staggered link entrance animation at `50 ms` delay per link.
8. WHILE the mobile drawer is open, WHEN the user clicks a nav link or the close control, THE
   Nav SHALL close the drawer; WHEN a nav link is clicked, the close SHALL occur after a `300 ms`
   delay to allow scroll to begin first.
9. WHEN the user clicks the Theme_Toggle, THE Nav SHALL toggle the `data-theme` attribute on
   `<html>` between `'dark'` and `'light'`.
10. WHEN the user clicks the Theme_Toggle, THE Nav SHALL persist the new theme value to
    `localStorage` under the key `'yoge-theme'`.
11. WHEN the page loads and `localStorage.getItem('yoge-theme')` returns a non-null value, THE
    Engine SHALL set `data-theme` on `<html>` to that value before the first CSS paint via an
    inline `<head>` script; IF the key is absent, THE Engine SHALL leave `data-theme` unset,
    defaulting to the dark theme.
12. IF `localStorage` throws an exception, THEN THE Engine SHALL catch it and default to the
    dark theme for the current session without throwing.

---

### Requirement 6: Scroll-Driven Section Animations

**User Story:** As a visitor, I want each narrative chapter to animate into view as I scroll,
so that the storytelling remains engaging and the page feels dynamic.

#### Acceptance Criteria

1. WHEN a Story_Section enters the viewport, THE Engine SHALL play that section's entrance
   animation exactly once; re-scrolling past the section SHALL NOT replay the animation.
2. WHEN a `.section-title` element is already in the viewport at page load, THE Engine SHALL
   immediately apply its final visible state via `gsap.set()` rather than waiting for a trigger.
3. WHEN the Journey section's scroll progress line enters the viewport, THE Engine SHALL scrub
   `.timeline__progress` height from `0 %` to `100 %` in sync with scroll position.
4. WHEN timeline entries in the Journey section enter the viewport, THE Engine SHALL animate
   even-indexed entries from `x: -65` and odd-indexed entries from `x: 65`, both to `x: 0`.
5. WHEN cards in the Quests, Battles, or Origin sections enter the viewport, THE Engine SHALL
   animate each card with a staggered entrance including `opacity`, `y` (or `x`), `rotation`,
   and `scale` transitions.
6. WHEN the user scrolls fast past multiple sections before ScrollTrigger has processed them,
   THE Engine SHALL ensure all pending entrance animations still fire, leaving no element stuck
   at `opacity: 0`.
7. WHERE the viewport is wider than the mobile breakpoint (`> 768 px`), THE Engine SHALL apply
   a subtle parallax scrub to `.section-bg__orb` and card elements as the user scrolls.

---

### Requirement 7: Accent Color System

**User Story:** As a visitor, I want the accent color to smoothly transition as I scroll between
chapters, so that each section has a distinct mood reinforced by color.

#### Acceptance Criteria

1. WHEN the user scrolls into a Story_Section, THE Accent_Color_System SHALL update
   `accentTarget` to the RGB triplet defined for that section in `SECTION_COLOR_MAP`.
2. THE Accent_Color_System SHALL lerp `accentCurr` toward `accentTarget` each RAF frame using
   a factor of `0.03`, writing the rounded result to `--ar`, `--ag`, `--ab` on `:root`.
3. THE Accent_Color_System SHALL terminate interpolation for a channel when
   `|accentTarget[channel] - accentCurr[channel]| ≤ 0.3`.
4. FOR ALL valid RGB start and target pairs, the Accent_Color_System SHALL converge
   `accentCurr` to within `0.3` of `accentTarget` within `500` animation frames.
5. THE Accent_Color_System SHALL define accent targets for the following eight sections:
   `prologue`, `origin`, `journey`, `quests`, `battles`, `discovery`, `credentials`, `contact`.

---

### Requirement 8: Cursor and Trail System

**User Story:** As a desktop visitor, I want a custom cursor and ghost trail, so that the
interaction feels polished and immersive.

#### Acceptance Criteria

1. WHERE the device has a fine pointer (`pointer: fine`), THE Engine SHALL create a custom
   cursor consisting of a `.cursor__dot` and `.cursor__ring` that track the pointer position.
2. WHERE the device has a fine pointer, THE FX_Layer SHALL create a Trail_System of `8` ghost
   dots that each interpolate toward the preceding dot's position using a speed derived from
   `0.40 − i × 0.028` for dot index `i`.
3. WHERE the device has a coarse pointer (`pointer: coarse`), THE Engine SHALL NOT create
   cursor dot, ring, or trail elements.
4. WHEN a pointer-interactive element (button, link, card) is hovered on a fine-pointer device,
   THE Engine SHALL apply a hover state to the `.cursor__ring` element.
5. THE FX_Layer SHALL merge cursor trail animation and Accent_Color_System lerp into a single
   `requestAnimationFrame` loop to avoid competing RAF callbacks.

---

### Requirement 9: Visual Effects Layer

**User Story:** As a visitor, I want the decorative visual effects — spotlight, marquee strips,
glitch text, particles — to run smoothly without degrading the page interaction experience.

#### Acceptance Criteria

1. WHEN the mouse moves over the Hero_Section on a fine-pointer device, THE FX_Layer SHALL
   update CSS variables to position a spotlight effect that tracks the cursor.
2. THE FX_Layer SHALL inject marquee strip content between Story_Sections and animate the strip
   horizontally using CSS, without JavaScript per-frame updates.
3. WHEN a `.section-eyebrow` element enters the viewport, THE Glitch_Animator SHALL start a
   `setInterval` at `28 ms` intervals that progressively reveals the original text, replacing
   unrevealed characters with random uppercase ASCII or digit characters.
4. WHEN the Glitch_Animator interval completes (`f ≥ total`), THE Glitch_Animator SHALL restore
   `element.textContent` to the original text exactly.
5. WHEN the user moves the mouse away from a `.section-eyebrow` mid-animation, THE
   Glitch_Animator SHALL clear the interval and restore `element.textContent` immediately.
6. WHILE the Glitch_Animator interval is running, THE Glitch_Animator SHALL ensure all
   characters at indices `< revealed` are the original characters, not scrambled characters.
7. THE FX_Layer SHALL spawn hero particle elements via JavaScript and animate them using CSS
   `@keyframes pRise`, adding zero JavaScript per animation frame.
8. WHERE the device has a fine pointer, THE FX_Layer SHALL apply VanillaTilt 3D tilt to project
   and battle cards.
9. WHERE the device has a fine pointer, THE FX_Layer SHALL apply a magnetic attraction effect
   to CTA buttons when the cursor approaches them.

---

### Requirement 10: Skill Bars

**User Story:** As a visitor, I want the skill progress bars in the Credentials section to
animate into view as I scroll to them, so that the skill levels are communicated clearly.

#### Acceptance Criteria

1. WHEN a `.skill-bar__fill` element enters the viewport, THE Engine SHALL animate its `width`
   from `0 %` to the integer percentage stored in its `data-width` attribute over `1.6 s` with
   `ease: 'power3.out'`.
2. WHEN a skill bar animation has been triggered, THE Engine SHALL call `observer.disconnect()`
   on its `IntersectionObserver` instance immediately after triggering, preventing any further
   callbacks for that element.
3. THE Engine SHALL guarantee that each `IntersectionObserver` for a skill bar fires and
   disconnects at most once per page load, regardless of how many times the element enters or
   leaves the viewport.
4. IF a `.skill-bar__fill` element has a `data-width` attribute value that is not a valid
   integer in the range 0–100, THEN THE Engine SHALL clamp the value to the nearest bound
   (`0` or `100`) rather than producing a broken animation.

---

### Requirement 11: Responsive Layout

**User Story:** As a visitor on any device, I want the site to adapt its layout and disable
heavy effects on lower-capability devices, so that the experience is usable and performant.

#### Acceptance Criteria

1. THE Site SHALL apply a mobile layout at viewport widths `≤ 768 px`, removing desktop-only
   effects (tilt, magnetic, trail, parallax) and displaying the mobile navigation drawer.
2. THE Site SHALL apply a tablet layout at viewport widths `> 768 px` and `≤ 1024 px`, using
   a two-column grid where applicable and disabling desktop parallax effects.
3. THE Site SHALL apply an enhanced wide layout at viewport widths `≥ 1440 px`, increasing
   container max-width and hero portrait size.
4. THE Site SHALL apply a 4K-optimised layout at viewport widths `≥ 2560 px`, further scaling
   fonts and spacing and capping max-widths to prevent excessive stretch.
5. WHEN the viewport width is `≤ 768 px`, THE Hero_Section SHALL spawn exactly `12` particles.
6. WHEN the viewport width is `> 768 px`, THE Hero_Section SHALL spawn exactly `25` particles.
7. THE Site SHALL NOT produce a horizontal scrollbar at viewport widths of 375 px, 768 px,
   1024 px, 1440 px, and 2560 px.

---

### Requirement 12: Reduced Motion and Accessibility

**User Story:** As a visitor who has requested reduced motion or uses assistive technology, I
want the site to remain fully readable and operable without relying on animation, so that the
content is accessible to everyone.

#### Acceptance Criteria

1. WHEN the user's OS reports `prefers-reduced-motion: reduce`, THE Site SHALL suppress all
   decorative CSS animations and transitions via `@media (prefers-reduced-motion: reduce)` rules,
   setting `animation-duration` and `transition-duration` to `0.01 ms` for all elements.
2. WHEN `prefers-reduced-motion: reduce` is active, THE Site SHALL set all `[data-reveal]`
   elements to `opacity: 1; transform: none` immediately via CSS, regardless of scroll position.
3. WHEN `prefers-reduced-motion: reduce` is active, THE Engine SHALL skip all GSAP entrance
   animation registrations and instead call `gsap.set()` immediately on all animated elements
   to set their final visible state.
4. THE Site SHALL comply with WCAG 2.1 Level AA for all content, including sufficient color
   contrast ratios (4.5:1 for normal text, 3:1 for large text and UI components), keyboard
   navigability, and visible focus indicators.
5. THE Site SHALL use semantic HTML5 landmark elements (`<header>`, `<nav>`, `<main>`,
   `<section>`, `<footer>`) to support screen reader navigation.
6. THE Site SHALL provide `alt` text for all non-decorative images.
7. WHERE Font Awesome icons are used as standalone interactive elements, THE Site SHALL provide
   an `aria-label` or visually hidden text alternative.

---

### Requirement 13: Theme System

**User Story:** As a visitor, I want a persistent light/dark theme toggle, so that I can view
the site in my preferred visual mode across sessions.

#### Acceptance Criteria

1. THE Site SHALL support a dark theme (default) and a light theme controlled by the
   `data-theme` attribute on the `<html>` element.
2. WHEN the `data-theme` attribute is `'light'`, THE Site's `theme.css` SHALL apply override
   styles that replace dark background tokens with light equivalents across all components.
3. WHEN the page loads and a stored theme is present, THE Site SHALL apply it before the first
   CSS paint; WHEN the page loads and no stored theme is present, THE Site SHALL render in the
   dark theme by default without setting `data-theme`.
4. WHEN the user toggles the theme, THE Site SHALL immediately update `data-theme` on `<html>`
   and persist the new value to `localStorage` under `'yoge-theme'` in the same event handler.
5. IF `localStorage` throws an exception, THE Site SHALL catch it and continue with the dark
   theme default for that session without throwing.

---

### Requirement 14: Error Handling and Resilience

**User Story:** As a visitor, I want the site to degrade gracefully when external resources
fail, so that the content remains readable even if scripts or images do not load.

#### Acceptance Criteria

1. IF the hero portrait image returns a `404` error, THEN THE Hero_Section SHALL swap the `src`
   to the fallback SVG at `assets/hero-portrait.svg` via an `onerror` inline handler on the
   `<img>` element.
2. IF GSAP is unavailable (CDN failure), THEN THE Engine SHALL add class `.is-ready` to
   `document.documentElement` so that all animated elements are displayed in their final visible
   state via CSS fallback rules, without throwing an unhandled exception.
3. IF Typed.js is unavailable, THEN `initTyped()` SHALL return early without throwing, leaving
   the `#typed-role` element empty; the surrounding `.hero-kicker` layout SHALL remain intact.
4. IF `localStorage` is unavailable, THEN THE Engine SHALL catch the exception and operate with
   an in-memory theme default of `'dark'` for the current session.
5. WHEN the user scrolls past sections before their ScrollTrigger callbacks have been processed,
   THE Engine SHALL rely on `fastScrollEnd: true` and `preventOverlaps: true` ScrollTrigger
   defaults so all queued entrance animations still fire, leaving no element at `opacity: 0`.

---

### Requirement 15: Performance

**User Story:** As a visitor, I want the site to load and animate quickly on a standard
connection, so that I am not waiting for the page to become usable.

#### Acceptance Criteria

1. THE Site SHALL use a single `requestAnimationFrame` loop (in `fx.js`) that handles both
   cursor trail interpolation and accent color lerping; no other competing RAF loops SHALL exist
   for these two concerns.
2. THE Site SHALL load all hero portrait images with `loading="eager"` and all below-fold images
   with `loading="lazy"`.
3. THE Site SHALL load Google Fonts with `&display=swap` appended to the font URL and a
   `<link rel="preconnect" crossorigin>` hint for `https://fonts.gstatic.com` in the `<head>`.
4. THE Site SHALL attach all `scroll`, `mousemove`, `resize`, and `touchmove` event listeners
   with `{ passive: true }`.
5. THE Site SHALL apply `will-change: transform` only to `.ctrail` (Trail_System dot) elements
   and `.marquee-inner`; it SHALL NOT be applied to card, tilt, or ring elements to avoid
   unintended stacking contexts.
6. THE Site SHALL register all ScrollTrigger entrance animations with `once: true` so triggers
   disconnect after firing and impose no ongoing per-scroll computation cost.

---

### Requirement 16: Security

**User Story:** As the site owner, I want the site to follow web security best practices, so
that visitors are not exposed to security vulnerabilities.

#### Acceptance Criteria

1. THE Site SHALL include `rel="noopener noreferrer"` on every `<a target="_blank">` element,
   including same-origin file links and certificate download links, to prevent tab-napping.
2. THE Site SHALL use the HTML `download` attribute on all certificate PDF and image anchor tags
   so files are served as client-side downloads rather than navigating to the file URL.
3. THE Site SHALL include `integrity` (SRI hash) and `crossorigin="anonymous"` attributes on
   every CDN `<script>` and CDN `<link>` tag for GSAP, Font Awesome, VanillaTilt, and Typed.js.
4. THE Site SHALL contain no user-facing `<form>` elements, `contenteditable` regions, or
   dynamic data injection points, eliminating any XSS or injection surface.

---

### Requirement 17: Print Styles

**User Story:** As a visitor who wants to print or save the page as a PDF, I want a clean
printed representation, so that the content is readable without decorative screen effects.

#### Acceptance Criteria

1. WHEN the page is printed or rendered to PDF, THE Site SHALL hide the following elements via
   `print.css`: `.loading-screen`, `.main-nav`, `#cursor`, `.marquee-strip`, `.hero-particles`,
   `#chflash`, `.ctrail`, `.scroll-progress`, and all elements with `aria-hidden="true"` that
   are purely decorative.
2. WHEN the page is printed, THE Site SHALL render all body text in black (`#000`) on a white
   (`#fff`) background regardless of the active `data-theme`.
3. WHEN the page is printed, THE Site SHALL display the full URL after each `<a>` element via
   `a::after { content: " (" attr(href) ")" }` so destinations are visible in print.

---

### Requirement 18: Asset and Data Contracts

**User Story:** As a developer adding new portfolio content, I want clear data contracts for
each content type, so that I can add entries consistently without breaking the layout.

#### Acceptance Criteria

1. WHEN a new timeline entry is added to the Journey section with all required `TimelineEntry`
   fields (`period`, `status`, `title`, `place`) present, THE Site SHALL render the entry
   within `.timeline`; IF any required field is absent, the entry SHALL NOT be rendered and a
   console warning SHALL be emitted.
2. WHEN a new project card is added to the Quests section with all required `ProjectCard` fields
   (`icon`, `year`, `tag`, `title`, `desc`, `tech`, `link`) present, THE Site SHALL render the
   card within `.project-grid`; IF any required field is absent, the card SHALL NOT be rendered.
3. WHEN a new battle card is added to the Battles section with all required `BattleCard` fields
   (`icon`, `tags`, `title`, `org`, `desc`) present, THE Site SHALL render the card within
   `.battle-grid`; optional fields (`date`, `certActions`) SHALL be omitted gracefully when absent.
4. WHEN a new section is added to the site, THE Engine SHALL require: an entry in
   `SECTION_COLOR_MAP` containing a three-element RGB array (each 0–255), a `data-section`
   attribute on the `<section>` element, and a `ScrollTrigger` scene registration in
   `initScrollScenes()`; IF any of these three are missing, THE Engine SHALL log a console
   warning identifying the missing element.
