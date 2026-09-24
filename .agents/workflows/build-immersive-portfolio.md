# Build Immersive Portfolio

Description: Rebuild or extend the portfolio as a coherent cinematic 3D story while preserving the Stitch visual system and existing site content.

Compatibility note: Antigravity documents Workflows as a legacy mechanism moving toward Agent Skills. Prefer /immersive-web for new work; keep this workflow as a repeatable project sequence while both systems are supported.

## Step 1 — Read the sources

Read:
- .agents/skills/immersive-web/SKILL.md
- .agents/rules/immersive-portfolio.md
- references/stitch-design.md
- references/current-site-inventory.md
- references/implementation-patterns.md
- docs/immersive-web-plan.md

Inspect the current implementation before editing it.

## Step 2 — Preserve content

Inventory every existing chapter, project, research item, credential, timeline event, CTA, external link, downloadable artifact, and footer detail.

Do not remove content merely because a new layout is being introduced.

## Step 3 — Establish the scene model

Create an explicit chapter model with:
- normalized scroll range
- camera position / path
- camera target
- world props
- lighting state
- HUD state
- transition behavior

Keep the data model separate from rendering logic.

## Step 4 — Implement the 3D world

Build the spatial environment first:
- corridor / archive / workshop geometry
- atmospheric background
- exhibits and physical slabs
- lighting anchors
- particles only where they reinforce depth

Use instancing and shared resources for repeated geometry.

## Step 5 — Bind scroll to motion

Use GSAP ScrollTrigger and Lenis where available.

Normalize scroll once, then drive:
- camera travel
- exhibit arrivals
- environmental changes
- chapter progress
- HUD transitions

Do not create independent scroll loops for individual elements.

## Step 6 — Create cinematic chapter beats

For each chapter:
- enter from a visually meaningful previous state
- reveal the focal object or information
- allow a brief stable reading period
- transition using camera/world continuity
- foreshadow the next chapter

Replace generic fade-up choreography with scene choreography.

## Step 7 — Add interaction

Add only interactions that reinforce spatial understanding:
- pointer light
- precise reticle
- magnetic CTA
- small exhibit tilt
- hover/focus illumination

Remove anything that distracts from content.

## Step 8 — Add shader/post-processing effects

Introduce effects one at a time and verify:
- readability
- frame rate
- reduced-motion behavior
- mobile fallback

Prefer restrained material/atmosphere changes over constant screen-wide distortion.

## Step 9 — Responsive and fallback pass

Test desktop, tablet, mobile, coarse pointer, reduced motion, and WebGL failure.

The DOM experience must remain complete even when the world layer is disabled.

## Step 10 — Validation

Run the site and inspect every chapter.
Check for:
- console errors
- horizontal overflow
- stuck opacity/visibility
- missing focus states
- scroll desynchronization
- broken links
- poor mobile touch targets
- excessive GPU/CPU cost

Fix issues before adding more effects.

## Step 11 — Final audit

Compare the result to the Stitch design system:
- palette
- typography
- spacing
- geometry
- hierarchy
- content ordering
- responsive composition

The implementation may be more immersive than the 2D reference, but it must still unmistakably belong to the same visual system.
