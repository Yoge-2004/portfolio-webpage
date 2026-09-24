# Stitch Design System — The Night Workshop / Archive

Source: Stitch export supplied for the portfolio rebuild.

## Brand & style

The visual language is a dark, tactile research laboratory and architectural archive. It combines academic rigor, mechanical craftsmanship, editorial typography, and quiet cinematic drama.

Avoid contemporary tech clichés:
- no synthetic purple
- no oversaturated neon
- no plastic glassmorphism

Prefer carved graphite, patinated bronze, textured stone, aged paper, controlled tungsten/brass lighting, crisp structural edges, and spatial depth.

## Palette

Core:
- Void: #070706
- Obsidian: #0D0C0A
- Warm Graphite: #211C16
- Dark Bronze: #30261D
- Bone: #F2EADF
- Muted Bone: #B9AA97
- Soft White: #FFF9F1
- Brass: #D7AA61
- Light Brass: #F0C98B
- Copper: #B96542
- Ember: #D87950

Usage:
- Brass is for high-intent interactive states, focus rings, progress rails, active milestones, and selected navigation.
- Copper marks research artifacts, contextual stress, technical parameters, and experimental branches.
- Ember is reserved for energetic competitive/live moments.
- Warm neutrals form structural surfaces and the environment.
- Shadows are warm-neutral; never use a pure black shadow as the main depth mechanism.

## Typography

Bodoni Moda:
- hero and chapter display
- major quotes and monumental editorial headings
- natural sentence/title case, not full uppercase

Manrope:
- narrative copy
- project descriptions
- normal UI labels

JetBrains Mono:
- telemetry
- coordinates
- timestamps
- chapter indices
- classifications
- metrics and system statuses
- positive tracking around 0.06em–0.12em
- uppercase for instrumentation labels

Desktop hero display:
- Bodoni Moda
- 4.5rem
- 4.75rem line height
- -0.03em tracking

Mobile hero display:
- Bodoni Moda
- 2.75rem
- 3rem line height
- -0.02em tracking

Body:
- Manrope 1rem / 1.625rem

Technical small label:
- JetBrains Mono 0.6875rem / 0.875rem
- 0.12em tracking

## Layout

Desktop:
- 12-column fluid grid
- outer margin 3rem
- gutter 1.5rem
- information zones align around left ledger, primary focus, and technical telemetry

Mobile:
- single-column layout
- margin 1.25rem
- gutter 1rem
- move overlays to persistent top/bottom anchors when necessary

Spacing:
- 4px xs
- 8px sm
- 16px md
- 24px lg
- 40px xl

## Depth system

Z-5: Far Void / Deep World
- #070706
- fog
- ambient particles
- distant atmospheric light

Z-4: Structural Environment
- #0D0C0A to #151310
- walls
- rails
- recesses

Z-3: Physical Slabs / Exhibits
- #211C16
- project plates
- timeline/research sheets

Z-2: Information HUD
- floating DOM panels
- telemetry
- chapter controls

Z-1: Interaction Beam
- cursor light
- focus rings
- active highlights

Elevation should come from physical lighting, materials, and real 3D coordinates rather than generic CSS drop shadows.

## Geometry

Roundedness is effectively zero for structural surfaces:
- cards
- slabs
- modals
- timelines
- action plates
- dividers

Use 1px structural hairlines.
Default inactive border: #30261D.
Active border: #D7AA61.

## Components

Primary button:
- brass surface
- void text
- JetBrains Mono
- uppercase
- hover moves upward slightly and brightens to Light Brass

Secondary button:
- transparent/inset
- Dark Bronze border
- Bone text
- hover changes border to Brass and fills with Warm Graphite

Text links:
- Manrope
- etched underline
- underline expands/brightens on interaction

Status chip:
- compact rectangular geometry
- JetBrains Mono uppercase
- neutral, research/published, and live/battle variants

Exhibit cards:
- matte charcoal
- Dark Bronze frame
- zero radius
- index stamp at top
- Bodoni title
- Manrope body
- optional subtle Three.js yaw/pitch of roughly 1–2 degrees on desktop

Inputs:
- Obsidian matte fill
- bottom structural rule
- Brass focus state with local warm glow

Telemetry lists:
- horizontal ruled rows
- ID/date on left
- subject in center
- metric/artifact link on right
- smooth hover surface change

## 3D interpretation

This document is a visual contract, not an instruction to recreate every component in flat HTML.

The final implementation should translate the physical metaphors into a continuous 3D environment:
- archive corridors
- structural rails
- exhibition slabs
- focused light pools
- paper/research artifacts
- camera travel between chapters

The 3D layer may extend the visual system, but must not contradict it.
