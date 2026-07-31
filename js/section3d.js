/* ============================================
   SECTION 3D SCENES — ambient background objects
   Vendored Three.js (js/vendor/three.min.js)
   Adds ambient, theme-aware, low-opacity 3D motifs
   behind the Origin and Journey sections. Same
   perf/accessibility contract as hero3d.js:
   pauses off-screen, static frame on reduced-motion,
   WebGL feature-detected.
   ============================================ */
(function () {
    'use strict';

    function readColors() {
        const cs = getComputedStyle(document.documentElement);
        const get = (name, fallback) => (cs.getPropertyValue(name) || fallback).trim();
        return {
            cyan: get('--accent-cyan', '#61e8f4'),
            purple: get('--accent-purple', '#9d8cff'),
            pink: get('--accent-pink', '#ff7cad')
        };
    }

    function makeRenderer(canvas) {
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: false, // wireframe/points scenes don't need it; cuts GPU cost
                powerPreference: 'high-performance'
            });
        } catch (e) {
            return null;
        }
        // Capped lower than hero3d — these are ambient background layers,
        // not the focal point, and every extra concurrent WebGL context
        // adds up against the frame budget Lenis's smooth scroll needs.
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setClearColor(0x000000, 0);
        return renderer;
    }

    function observeVisibility(sectionEl, onChange) {
        let isVisible = true;
        if (sectionEl && 'IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    isVisible = entry.isIntersecting;
                    onChange(isVisible);
                });
            }, { threshold: 0.05 });
            io.observe(sectionEl);
        }
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) { isVisible = false; onChange(false); }
        });
        return () => isVisible;
    }

    function fitToWrapper(canvas, renderer, camera) {
        const wrapper = canvas.parentElement;
        const w = wrapper.clientWidth || window.innerWidth;
        const h = wrapper.clientHeight || window.innerHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }

    /* ── Origin: a faceted "genesis" crystal cluster ──────
       A slowly tumbling group of low-poly gems, echoing
       the "beginning of the story" theme. Sparse and dim
       so it reads as atmosphere, not decoration fighting
       the narrative text. */
    function initOriginScene() {
        const canvas = document.getElementById('origin3d');
        if (!canvas || typeof THREE === 'undefined') return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isSmallScreen = window.innerWidth < 640;
        if (isSmallScreen) return; // ambient-only extra; skip on small screens for perf

        const renderer = makeRenderer(canvas);
        if (!renderer) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
        camera.position.set(0, 0, 8);

        let colors = readColors();
        const group = new THREE.Group();
        scene.add(group);

        const gemDefs = [
            { size: 0.9, color: 'cyan', x: -2.6, y: 0.6, z: -1 },
            { size: 0.55, color: 'purple', x: 2.4, y: -1, z: -2 },
            { size: 0.4, color: 'pink', x: 1.6, y: 1.6, z: -1.5 },
            { size: 0.65, color: 'cyan', x: -1.6, y: -1.8, z: -2.5 }
        ];

        const gems = gemDefs.map((def) => {
            const geo = new THREE.OctahedronGeometry(def.size, 0);
            const wire = new THREE.WireframeGeometry(geo);
            const mat = new THREE.LineBasicMaterial({
                color: colors[def.color],
                transparent: true,
                opacity: 0.35
            });
            const mesh = new THREE.LineSegments(wire, mat);
            mesh.position.set(def.x, def.y, def.z);
            mesh.userData.speed = 0.08 + Math.random() * 0.1;
            group.add(mesh);
            return { mesh, mat };
        });

        function applyColors() {
            colors = readColors();
            gems.forEach((g, i) => g.mat.color.set(colors[gemDefs[i].color]));
        }

        function resize() { fitToWrapper(canvas, renderer, camera); }
        resize();
        window.addEventListener('resize', resize);

        const section = document.getElementById('origin');
        let isVisible = true;
        const getVisible = observeVisibility(section, (v) => { isVisible = v; });

        const themeObserver = new MutationObserver(applyColors);
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        const clock = new THREE.Clock();

        function renderStatic() {
            gems.forEach((g) => g.mesh.rotation.set(0.4, 0.5, 0));
            renderer.render(scene, camera);
        }

        function frameFn() {
            if (!getVisible()) return;
            const dt = clock.getDelta();
            gems.forEach((g) => {
                g.mesh.rotation.y += dt * g.mesh.userData.speed;
                g.mesh.rotation.x += dt * g.mesh.userData.speed * 0.6;
            });
            group.rotation.y = Math.sin(clock.elapsedTime * 0.05) * 0.1;
            renderer.render(scene, camera);
        }

        if (reduceMotion) {
            renderStatic();
        } else if (window.RenderLoop) {
            window.RenderLoop.register(frameFn);
        } else {
            (function tick() { requestAnimationFrame(tick); frameFn(); })();
        }
    }

    /* ── Journey: a drifting particle constellation ───────
       A field of faint points forming a loose path,
       echoing the timeline. Reacts gently to scroll
       progress within the section via GSAP ScrollTrigger
       when available, otherwise just drifts. */
    function initJourneyScene() {
        const canvas = document.getElementById('journey3d');
        if (!canvas || typeof THREE === 'undefined') return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isSmallScreen = window.innerWidth < 640;
        if (isSmallScreen) return;

        const renderer = makeRenderer(canvas);
        if (!renderer) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
        camera.position.set(0, 0, 9);

        let colors = readColors();

        const COUNT = 140;
        const positions = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i++) {
            // loose helical path, echoing a timeline winding through space
            const t = i / COUNT;
            const angle = t * Math.PI * 6;
            const radius = 2.2 + Math.sin(t * Math.PI * 2) * 0.6;
            positions[i * 3] = Math.cos(angle) * radius + (Math.random() - 0.5) * 0.8;
            positions[i * 3 + 1] = (t - 0.5) * 7 + (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 2] = Math.sin(angle) * radius - 2 + (Math.random() - 0.5) * 0.8;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.PointsMaterial({
            color: colors.purple,
            size: 0.045,
            transparent: true,
            opacity: 0.5,
            sizeAttenuation: true
        });
        const points = new THREE.Points(geo, mat);
        scene.add(points);

        function applyColors() {
            colors = readColors();
            mat.color.set(colors.purple);
        }

        function resize() { fitToWrapper(canvas, renderer, camera); }
        resize();
        window.addEventListener('resize', resize);

        const section = document.getElementById('journey');
        let isVisible = true;
        const getVisible = observeVisibility(section, (v) => { isVisible = v; });

        const themeObserver = new MutationObserver(applyColors);
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        // Gentle scroll-linked rotation, matching the timeline's progress fill.
        let scrollProgress = 0;
        if (window.gsap && window.ScrollTrigger && !reduceMotion) {
            ScrollTrigger.create({
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
                onUpdate: (self) => { scrollProgress = self.progress; }
            });
        }

        const clock = new THREE.Clock();

        function renderStatic() {
            points.rotation.y = 0.3;
            renderer.render(scene, camera);
        }

        function frameFn() {
            if (!getVisible()) return;
            const dt = clock.getDelta();
            points.rotation.y += dt * 0.05;
            points.rotation.x = scrollProgress * 0.5 - 0.25;
            renderer.render(scene, camera);
        }

        if (reduceMotion) {
            renderStatic();
        } else if (window.RenderLoop) {
            window.RenderLoop.register(frameFn);
        } else {
            (function tick() { requestAnimationFrame(tick); frameFn(); })();
        }
    }

    function init() {
        initOriginScene();
        initJourneyScene();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
