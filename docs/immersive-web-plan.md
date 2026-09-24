# Immersive Web Implementation Plan

## Objective

Turn the current portfolio into a continuous spatial story while preserving the Stitch 2D visual system and all existing portfolio content.

## Phase 0 — Audit

Record:
- current DOM structure
- existing CSS tokens
- current Three.js scene
- current GSAP/ScrollTrigger wiring
- Lenis integration
- current mobile/reduced-motion behavior
- existing assets and vendor libraries

Do not change architecture during the first audit.

## Phase 1 — Visual foundation

Make the DOM implementation match the Stitch design:
- palette
- typography
- spacing
- zero-radius geometry
- technical labels
- exhibit/card hierarchy
- responsive layout

The 3D world should inherit the same tokens.

## Phase 2 — World model

Create explicit data for chapters:
- id
- scroll range
- camera position or spline interval
- camera target
- environmental preset
- lighting preset
- exhibits
- HUD emphasis
- transition type

Keep scene configuration separate from rendering code.

## Phase 3 — Camera choreography

Build a continuous camera route.

Requirements:
- no hard jump between chapters
- meaningful look-at changes near exhibits
- subtle pointer influence
- readable movement speed
- stable reading windows
- forward motion that remains understandable on fast scroll

## Phase 4 — Environmental transitions

As chapter progress changes:
- update fog/atmosphere
- move or intensify light pools
- reveal structural geometry
- activate exhibit materials
- change post-processing intensity only when it reinforces a narrative beat

Avoid constant visual churn.

## Phase 5 — DOM/world synchronization

Every major world event should have a clear DOM consequence where appropriate.

Examples:
- exhibit arrives → project panel becomes primary
- chapter light changes → telemetry accent updates
- camera focuses → related metadata appears
- chapter exits → previous DOM state resolves before the next focal state becomes dominant

## Phase 6 — Interaction

Add:
- pointer light
- precise reticle
- subtle exhibit tilt
- magnetic CTA
- focus/hover illumination

Do not use interaction for essential information.

## Phase 7 — Shaders and post-processing

Introduce:
- material variation
- restrained bloom
- haze/noise
- transition distortion
- depth cues

Every effect must have:
- a visual purpose
- a performance budget
- a reduced-motion behavior
- a fallback

## Phase 8 — Responsive degradation

Desktop:
- complete spatial world

Tablet:
- reduced density and parallax

Mobile/coarse pointer:
- simpler world
- no cursor system
- no magnetic interaction
- reduced particles
- reduced post-processing
- complete DOM content

Fallback:
- disable WebGL cleanly and preserve the narrative in DOM

## Phase 9 — Audit

Validate:
- 390px
- 768px
- 1024px
- 1440px
- 2560px
- reduced motion
- coarse pointer
- WebGL context loss
- rapid scrolling
- refresh on deep links/anchors
- keyboard-only navigation
- console cleanliness
- no horizontal overflow

## Definition of done

The site should feel like one world that happens to contain chapters.

A visitor should perceive:
1. entering a space
2. moving through it
3. discovering an exhibit
4. focusing on it
5. understanding its story
6. moving onward to the next environment

That continuity is more important than the number of effects.
