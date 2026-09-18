---
name: immersive-portfolio
description: Persistent workspace constraints for the Yogeshwaran portfolio. Apply when editing the portfolio UI, 3D world, animation system, visual effects, responsive behavior, or design-system tokens.
activation: model-decision
---

# Immersive Portfolio Workspace Rule

## Visual direction

The portfolio is a dark tactile archive / research workshop. Preserve the Stitch visual language:
- warm dark neutrals
- brass/copper/ember accents
- editorial serif + neutral sans + technical mono typography
- crisp architectural geometry
- zero-radius structural cards and slabs
- depth through lighting, materials, atmosphere, and camera position

Never introduce purple, synthetic neon, or blue/green gradients as a design direction.

## Existing stack

The repository already has a cinematic chapter-based experience and a Three.js + GSAP ScrollTrigger + Lenis foundation. Improve the existing architecture before replacing it.

Prefer surgical refactors over wholesale rewrites unless there is a concrete architectural reason.

## Spatial storytelling

Do not build each section as an unrelated animation block.

For every chapter, establish:
- camera state
- world/exhibit state
- lighting state
- DOM/HUD state
- entrance beat
- exit/transition beat

Use continuity between chapters.

## Animation rules

Use GSAP/ScrollTrigger for coordinated scroll scenes.
Use one normalized scroll state instead of many competing scroll listeners.
Avoid per-frame layout reads and style writes when a compositor-friendly transform or shader uniform is sufficient.
Keep secondary effects subordinate to reading and navigation.

## 3D rules

Use actual 3D where depth, lighting, camera motion, spatial exhibits, particles, or physically meaningful parallax are required.
Do not use CSS 3D as a substitute for an actual world when the scene needs lighting or camera choreography.

## Responsive behavior

At coarse pointer / mobile:
- no custom cursor or trail
- no magnetic CTA
- simplify parallax
- reduce particle counts
- reduce or remove post-processing
- retain complete content and navigation

Provide a DOM-first fallback if WebGL fails.

## Accessibility and motion

Respect prefers-reduced-motion.
Do not hide content until an animation resolves.
All essential actions must work with keyboard and touch.
Focus styles must remain visible.

## Validation

Every significant UI/animation change must be checked at:
- 390px mobile
- 768px tablet boundary
- 1024px
- 1440px
- 2560px

Also check:
- reduced motion
- coarse pointer
- WebGL failure path
- refresh at mid-page anchor
- rapid scrolling through all chapters
- browser console for runtime errors

Use the Stitch reference before making subjective visual changes.
