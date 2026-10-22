# Portfolio v2 — a 3D world you fly through

Plain HTML, CSS and vanilla JavaScript. No frameworks, no build step.

## Run locally
Serve the folder over HTTP (ES modules do not load from `file://`):

    python3 -m http.server 8000
    # open http://localhost:8000

## How it works
- `js/scene.js` is one fragment shader that raymarches a lit 3D world: a chrome sculpture, glowing gates, a neural lattice, data monoliths, a helix and a stack of network layers, over a reflective floor. Six set pieces repeat along a long corridor.
- `js/app.js` maps the page scroll to the camera's flight along that corridor. Each section owns a stretch of the flight (`data-u="start,end"` in `index.html`, in cells).
- The page in front: kinetic hero type, a statement whose words light up as you read, animated architecture diagrams per project, stacked project cards, marquees, a draggable certificate gallery, a custom cursor and magnetic buttons.
- Night and Day themes (toggle in the header; remembered). Both are lit differently in the 3D scene.

## Options (URL parameters)
- `?nopre` skips the intro loader.
- `?scale=0.5` fixes the 3D render scale (otherwise an adaptive governor picks it from frame time).
- `?field=css` turns the 3D scene off and uses the CSS backdrop.

## Behaviour
- Respects `prefers-reduced-motion`: no camera inertia, no ambient motion, reveals are instant.
- Without WebGL2, the page falls back to a CSS backdrop. All content and navigation still work.
- On screens under 960px wide, or shorter than 860px, the project cards flow instead of stacking.

## Performance
- The 3D render scale adapts to measured frame time (0.36–0.9 of CSS pixels). Motion and timing never change; only resolution does.
- Shader: sky pixels exit the march early, the floor reflection gets a smaller step budget, fewer ambient-occlusion samples, and a shorter far plane. Measured on the same software renderer, this was about 30% faster in the hero and about 65% faster in the lattice scene, against the previous build.
- Once nothing has moved for 1.5 s, the 3D renders at half rate. Scroll-driven DOM updates only run when the scroll position or layout changed.
- No `backdrop-filter` or CSS `filter` sits over the live canvas; surfaces use opaque-ish backgrounds, and card dimming uses an opacity layer.

## Deploy
GitHub Pages serves this repository from the root of `master` (legacy branch build), so there is no build step and no workflow: push to `master` and the site updates. The `.nojekyll` file stops Pages from running Jekyll over the files.

## Behaviour
- Respects `prefers-reduced-motion`: no camera inertia, no ambient motion, reveals are instant.
- Without WebGL2, the page falls back to a CSS backdrop. All content and navigation still work.
- On screens under 960px wide, or shorter than 860px, the project cards flow instead of stacking.

## Performance
- The 3D render scale adapts to measured frame time (0.36–0.9 of CSS pixels). Motion and timing never change; only resolution does.
- Shader: sky pixels exit the march early, the floor reflection gets a smaller step budget, fewer ambient-occlusion samples, and a shorter far plane. Measured on the same software renderer, this was about 30% faster in the hero and about 65% faster in the lattice scene, against the previous build.
- Once nothing has moved for 1.5 s, the 3D renders at half rate. Scroll-driven DOM updates only run when the scroll position or layout changed.
- No `backdrop-filter` or CSS `filter` sits over the live canvas; surfaces use opaque-ish backgrounds, and card dimming uses an opacity layer.

## Deploy (replaces the live site)
1. Replace the repository contents with this folder (keep `.git`).
2. Delete the old Vite project: `src/`, `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.json`, and the old deploy workflow.
3. GitHub Pages: Source = branch `master`, folder `/ (root)`.

## What has and has not been checked
- Checked: modules parse; the page loads with no console errors; the shader compiles; every section laid out on desktop and several on phone with the 3D off (no horizontal overflow at 1440 or 390 wide); hero, research and work rendered with the 3D on; Day theme hero; Night hero at phone size.
- Not checked: real frame rates (headless Chromium renders WebGL in software, so only before/after ratios are meaningful); the 3D behind sections 2, 4, 6–9; Day theme beyond the hero; tablet sizes; real touch devices.
