# Reference Implementation Audit & Architecture Adaptations

This document proves how the reference repositories were studied, analyzed, and concretely adapted into this project's modular architecture to elevate the interactive storytelling, camera choreography, and 3D depth without sacrificing the Stitch design language or authentic portfolio content.

---

## 1. Fireship — Three.js Scroll Animation Demo
- **Repository**: [fireship-io/threejs-scroll-animation-demo](https://github.com/fireship-io/threejs-scroll-animation-demo)
- **Core Technique Studied**:
  - Direct normalized mapping from document scroll progression (`0.0` to `1.0`) to 3D world parameters.
  - Linear parametric evaluation along a 3D trajectory.
- **Deficiency in Literal Implementation**:
  - The Fireship demo is purely linear: camera moves at constant velocity along a straight line regardless of scene density, which produces flat, uninspired scrolling without moments of pause, observation, or anticipation.
- **Our Concrete Adaptation**:
  - **Spline Velocity Modulation**: In `js/world/camera.js`, we map normalized scroll into a `CatmullRomCurve3` path with distinct spatial zones. Instead of constant forward velocity, the camera intentionally slows down when entering reading zones (`Discovery` and `Quests` exhibits) and accelerates through transitional corridors (`Arena` and `Path`).
  - **Location in Codebase**: `js/world/camera.js` (`progressOfZ()`, `updateCamera()`), `js/core/config.js` (`WAYPOINTS`).

---

## 2. CherryTree — Cinematic Scene Choreography
- **Repository**: [boydcroberts/CherryTree](https://github.com/boydcroberts/CherryTree)
- **Core Technique Studied**:
  - Multi-scene composition where each major narrative chapter operates as a distinct environmental state.
  - Coordinated scene transitions using GSAP ScrollTrigger to cross-fade lighting, camera look-at targets, fog density, and post-processing buffers simultaneously.
  - Lenis smooth scrolling tightly synchronized with GSAP's rendering ticker.
- **Our Concrete Adaptation**:
  - **Environmental Chapter Presets**: In `js/world/environment.js` and `js/world/lighting.js`, we establish discrete chapter lighting presets (Tungsten entrance $\rightarrow$ Bronze origin $\rightarrow$ Copper neuro-symbolic cluster $\rightarrow$ Ember industrial arena $\rightarrow$ Radiant golden horizon).
  - **Synchronized Transitions**: Rather than independent DOM scroll listeners, chapter entry events in `js/animation/transitions.js` trigger atmospheric fog color shifts, spotlight intensity snaps, and HUD telemetry updates in one synchronized beat.
  - **Location in Codebase**: `js/world/lighting.js` (`updateLighting()`), `js/world/world.js` (`tick()`), `js/animation/transitions.js`, `js/animation/scroll.js`.

---

## 3. 3D Interactive Portfolio — Interactive Depth & Micro-interactions
- **Repository**: [brylcoderr/3d-interactive-portfolio-site](https://github.com/brylcoderr/3d-interactive-portfolio-site)
- **Core Technique Studied**:
  - Desktop precision cursor reticle tracking mouse coordinates with lag easing.
  - Magnetic attraction on high-intent CTA buttons with spring damping.
  - Subtle pointer-reactive 3D parallax offsetting the camera's rotational matrix without inducing motion sickness.
  - Kinetic typography and text splitting for editorial headings.
- **Our Concrete Adaptation**:
  - **Architectural Reticle Cursor**: In `js/interaction/cursor.js`, we built a precision corner-bracket crosshair that tracks pointer coordinates and expands into targeting brackets over interactive cards and links.
  - **Magnetic CTA Physics**: In `js/interaction/magnetic.js`, buttons gently translate toward the pointer on proximity (desktop only), creating tactile physical weight.
  - **Restrained 1.5° 3D Parallax**: In `js/world/camera.js` and `js/interaction/pointer.js`, pointer offsets smoothly bank the camera along the tangent of the guide rail.
  - **Location in Codebase**: `js/interaction/cursor.js`, `js/interaction/magnetic.js`, `js/interaction/pointer.js`, `css/effects/cursor.css`.

---

## 4. Portfolio-Cinematic — Transition Staging & Spatial Exhibits
- **Repository**: [Rohithpranov07/Portfolio-cinematic](https://github.com/Rohithpranov07/Portfolio-cinematic)
- **Core Technique Studied**:
  - Treating portfolio projects as physical museum exhibits located in distinct alcoves of a spatial world rather than flat 2D cards on top of a canvas.
  - Camera approach choreography: approach $\rightarrow$ recognition $\rightarrow$ focus $\rightarrow$ presentation $\rightarrow$ departure.
  - Restrained post-processing bloom on selective emissive materials (wireframes, guide rails, and status beacons).
- **Our Concrete Adaptation**:
  - **Unobstructed 3D Exhibition Slabs**: In `js/world/exhibits.js` and `css/components/projects.css`, we eliminated the visual redundancy of 2D cards covering the 3D world. Project text sits on the flank while the physical 3D graphite slab occupies full spatial view.
  - **Exhibit Approach Choreography**: As the camera reaches an exhibit's Z-coordinate, the 3D slab steps forward out of the alcove wall, rotates to face the viewer, and its dedicated brass spotlight brightens from 1.4 to 6.2 intensity.
  - **Selective UnrealBloomPass**: Restrained bloom (strength 0.35, threshold 0.88) applied to glowing copper and brass edges on desktop, completely omitted on mobile for 60fps performance.
  - **Location in Codebase**: `js/world/exhibits.js` (`updateExhibits()`), `js/world/postprocessing.js`, `css/components/projects.css`.

---

## 5. Architectural Synthesis Matrix

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      SPATIAL ARCHIVAL NARRATIVE                         │
├─────────────────────────────────────────────────────────────────────────┤
│  Fireship:          Non-linear spline velocity modulation               │
│  CherryTree:        Synchronized multi-scene atmospheric transitions    │
│  3D Interactive:    Precision reticle & magnetic spring interactions    │
│  Portfolio-Cinematic: Spatial 3D exhibit approach & departure choreography│
│  Stitch Reference:  Dark tactile archive, Bodoni/Manrope/Mono, zero-radius│
└─────────────────────────────────────────────────────────────────────────┘
```
