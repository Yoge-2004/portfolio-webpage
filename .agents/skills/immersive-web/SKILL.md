---
name: immersive-web
description: Builds, refactors, and audits immersive portfolio websites with cinematic 3D depth, scroll choreography, camera-driven storytelling, WebGL/Three.js, GSAP, Lenis, shaders, responsive degradation, accessibility, and performance. Use when designing or implementing a portfolio where the experience must feel spatial, narrative, and physically rendered rather than like animated 2D cards.
---

# Immersive Web Skill — The Night Workshop

## Mission

Treat the portfolio as an interactive spatial story, not a collection of animated sections.

The target experience combines the Stitch design system with a real 3D world:
- dark tactile archive / research-laboratory atmosphere
- warm brass/copper/ember accents; no purple, synthetic neon, or blue/green gradients
- editorial Bodoni Moda headlines
- Manrope narrative/UI copy
- JetBrains Mono telemetry
- sharp architectural geometry and zero-radius structural surfaces
- continuous depth, camera motion, lighting falloff, scene transitions, and scroll-linked choreography
- every major animation must serve navigation, hierarchy, interaction, or story progression

## Source of truth

Read these references before changing visual or interaction architecture:
- references/stitch-design.md — Stitch design system and tokens
- references/current-site-inventory.md — existing repository structure, sections, and interaction baseline
- references/implementation-patterns.md — external pattern references and how to use them
- docs/immersive-web-plan.md — project-level architecture and implementation phases

Do not invent a new visual language when the references already define one.

## Core architecture

Prefer this separation:

DOM/UI
  → semantic content, accessible controls, typography, HUD, forms

3D World
  → Three.js / React Three Fiber only when it provides real value
  → camera, lights, meshes, materials, particles, scene state

Motion orchestration
  → GSAP timelines and ScrollTrigger
  → Lenis for smooth scrolling where supported

Visual effects
  → shaders, post-processing, particles, cursor field, lighting response

State model
  → one normalized scroll progress
  → explicit chapter/scene state
  → deterministic transitions between scenes

Do not add a framework solely because examples use it. Preserve the repository's existing architecture unless a migration is justified by measurable benefit.

## Narrative rule

Design scroll as movement through a world.

Each chapter should define:
1. where the camera is
2. what is physically present in the world
3. what is revealed or hidden
4. which DOM overlays become relevant
5. how lighting/material response changes
6. what the visitor is expected to notice
7. how the next chapter is foreshadowed

Avoid a sequence of isolated fade-ins. Use continuity: the end state of one chapter should motivate the beginning of the next.

## 3D implementation rules

Use real 3D for:
- camera travel
- exhibit objects and architectural slabs
- depth layering
- lights and volumetric atmosphere
- particles that inhabit space
- parallax caused by camera position rather than only CSS transforms
- objects that rotate toward or react to the visitor
- portals, tunnels, corridors, rooms, or spatial transitions

Use DOM/CSS for:
- text
- accessibility-critical controls
- long-form reading
- forms
- navigation
- data tables
- content that must remain crisp and selectable

Do not fake a 3D requirement with hundreds of absolutely positioned divs when WebGL is the appropriate medium.

## Camera choreography

The camera is part of the storytelling.

Prefer:
- spline or waypoint-driven camera paths for long journeys
- look-at targets that change near meaningful exhibits
- eased transitions between chapter camera states
- small pointer influence layered on top of scroll movement
- depth-of-field or atmospheric treatment only when it clarifies focal hierarchy

Avoid:
- uncontrolled camera shake
- constant random motion
- excessive FOV changes
- camera movement that makes reading difficult
- unrelated camera motion that competes with content

Keep a clear separation between:
scrollProgress → world position
pointerState → subtle secondary offset
chapterState → focal target / lighting / post-processing

## Scroll choreography

Use GSAP ScrollTrigger for chapter-level synchronization.

A good scene may coordinate:
- camera z/x/y
- camera target
- exhibit rotation
- exhibit scale
- light intensity/color
- fog density
- DOM opacity/transform
- progress indicators
- chapter labels
- shader uniforms

Scrub continuous transformations; use one-shot timelines for deliberate arrivals/exits.

Do not bind dozens of independent scroll handlers to the same scroll state. Centralize normalization and let the animation system consume it.

## Smooth scrolling

Lenis may be used for desktop/tablet smooth scrolling, but:
- disable or simplify it when reduced motion is requested
- do not double-integrate scroll with multiple RAF loops
- keep ScrollTrigger synchronized with Lenis
- guarantee native scrolling remains usable when the enhanced layer fails

## Shaders and post-processing

Shaders are for meaningful atmosphere, not decoration.

Good uses:
- subtle heat/haze
- procedural tunnel surfaces
- filmic distortion during transitions
- restrained chromatic separation
- paper/stone/material variation
- light bloom around active exhibits
- environment transitions

Never use effects that destroy text legibility or make interaction ambiguous.

Keep shader uniforms explicit and documented. Prefer low-resolution or effect-scaled buffers when the visual result is similar.

## Materials and lighting

Respect the Stitch palette:
- Void #070706
- Obsidian #0D0C0A
- Warm Graphite #211C16
- Dark Bronze #30261D
- Bone #F2EADF
- Muted Bone #B9AA97
- Soft White #FFF9F1
- Brass #D7AA61
- Light Brass #F0C98B
- Copper #B96542
- Ember #D87950

Shadows should be warm-neutral, never clipped black.
Use physical light falloff and material contrast instead of heavy CSS shadows.
Structural geometry is crisp and zero-radius.

## Interaction language

Desktop:
- precise custom cursor/reticle is allowed
- subtle magnetic attraction for high-intent CTAs
- 1–2 degree object tilt can reinforce depth
- pointer-reactive lighting should be local and restrained

Touch:
- remove cursor/trail systems
- remove magnetic interactions
- simplify expensive parallax
- preserve all important navigation and content
- never require hover to understand an action

## Responsive degradation

Define explicit capability tiers.

High capability:
- full 3D corridor/world
- post-processing
- rich pointer response
- particles

Standard:
- 3D world with reduced density/effects
- limited post-processing
- no unnecessary secondary effects

Low capability / failure:
- DOM narrative remains complete
- static exhibit imagery or flat material fallback
- native scroll
- no blank WebGL canvas
- no hidden content

Use prefers-reduced-motion, coarse-pointer detection, viewport size, and WebGL context availability.

## Accessibility

All DOM interactions must remain accessible without 3D:
- semantic landmarks
- keyboard navigation
- visible focus
- descriptive labels
- logical heading hierarchy
- reduced-motion path
- sufficient contrast
- no information encoded by animation alone

Never move focus based on purely decorative scene changes.

## Performance

Before shipping:
- profile frame time on a real laptop and mobile device
- cap device pixel ratio
- avoid per-frame DOM layout reads
- reuse geometries/materials where practical
- instance repeated meshes
- lazy-load heavy assets and non-critical scene content
- avoid unnecessary allocations inside the render loop
- pause or reduce work when the page is hidden
- handle WebGL context loss gracefully

A visually impressive effect that causes scroll stutter is a defect.

## Failure handling

The site must still function when:
- WebGL is unavailable
- a shader fails
- GSAP fails to load
- Lenis is unavailable
- an asset is missing
- the user requests reduced motion

Fallback order:
1. full enhanced experience
2. simplified 3D experience
3. DOM-first cinematic experience
4. fully static readable site

Never leave content permanently at opacity 0 because an animation dependency failed.

## Implementation workflow

Work in this order:
1. audit current repository and Stitch references
2. establish semantic DOM and responsive layout
3. preserve and migrate the existing content
4. build the spatial world
5. bind the camera to normalized scroll
6. choreograph each chapter
7. add focused interactions
8. add shader/post-processing layers
9. implement responsive degradation
10. run visual, accessibility, and performance audits

After each phase, run the application, inspect the result, and fix regressions before moving to the next phase.

## Quality gate

Do not declare the experience complete until:
- chapter transitions feel continuous
- there is visible depth even when the user stops scrolling
- the camera has intentional focal changes
- 3D elements react as part of the story, not as floating decoration
- mobile remains coherent without desktop-only effects
- reduced-motion is usable
- console errors are addressed
- no horizontal overflow exists at supported breakpoints
- the final implementation matches the Stitch visual language
