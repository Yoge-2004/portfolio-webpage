# Current Portfolio Inventory

Target repository: Yoge-2004/portfolio-webpage

## Existing implementation baseline

The current repository is already a cinematic static portfolio rather than a blank starter.

The existing implementation contains:
- a chapter-based single-page narrative
- a fixed top navigation and mobile menu
- a Three.js world layer
- GSAP + ScrollTrigger
- Lenis smooth scrolling
- an exhibit system using real Three.js meshes
- a corridor/path built with instanced geometry
- floating particles
- lighting and fog changes along the path
- exhibit panels that rotate/focus as the camera approaches
- DOM content that remains separate from the 3D world
- reduced-motion and touch-specific degradation paths

The important architectural goal is therefore enhancement and cleanup, not blindly replacing the whole site.

## Narrative chapters present in the Stitch design

The exported Stitch design maps the portfolio into:
1. Prologue
2. Origin
3. Path
4. Quests
5. Arena
6. Discovery
7. Capability
8. Contact

The existing repository also contains the corresponding narrative concepts of origin/journey/quests/battles/discovery/credentials/contact. Preserve semantic content while allowing naming and presentation to converge on the Stitch terminology.

## Portfolio content represented by the design

The Stitch screen includes:
- hero identity and role
- software development + applied ML positioning
- research emphasis
- a fake job detection project
- a private digital diary project
- an expense tracker project
- research/publication information
- an educational and professional timeline
- capability/skills information
- a contact / collaboration section
- résumé access
- GitHub, LinkedIn, and email paths
- telemetry-like metadata and chapter indexing

Use the source repository as the factual content baseline and do not silently invent new credentials, employers, papers, awards, or metrics.

## Existing technical direction

The repository already imports local vendor copies of:
- Three.js
- Three.js post-processing passes
- GSAP
- ScrollTrigger
- Lenis

The world code uses:
- a spline-like camera path
- instanced walls/floor
- exhibit panels and frames
- point lights
- particle points
- bloom on capable desktop paths
- camera look-at behavior influenced by nearby exhibits
- scroll-normalized progression

## Current pain point to solve

The next version must increase perceived depth and narrative flow without turning the site into a disconnected collection of effects.

Target improvements:
- stronger spatial continuity between chapters
- more intentional camera choreography
- meaningful scene changes, not generic section fades
- clearer focal transitions to exhibits
- better use of environment lighting and atmosphere
- stronger relationship between DOM content and world events
- graceful degradation on lower-capability devices
