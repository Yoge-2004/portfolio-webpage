/* ============================================
   PERSISTENT SCROLL 3D LAYER
   A fixed, full-page ambient field of nodes that
   dollies forward as the whole page scrolls and
   re-tints to match whichever section is active.
   Sits behind every section (which use slightly
   translucent backgrounds — see origin/journey/
   quests/battles/discovery/credentials/contact.css)
   so it reads as a soft ambient wash, not a distraction.
   ============================================ */
(function () {
    'use strict';

    function initScroll3D() {
        const canvas = document.getElementById('scroll3d');
        if (!canvas || typeof THREE === 'undefined') return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isSmallScreen = window.innerWidth < 640;

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: false,
                powerPreference: 'high-performance'
            });
        } catch (e) {
            return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.5 : 2));

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 120);
        camera.position.z = 10;

        const group = new THREE.Group();
        scene.add(group);

        // ── Node field ─────────────────────────────────────
        const NODE_COUNT = isSmallScreen ? 90 : 200;
        const DEPTH = 90;               // total tunnel length
        const RADIUS = 9;               // spread around the camera path

        const positions = new Float32Array(NODE_COUNT * 3);
        const nodePts = [];
        for (let i = 0; i < NODE_COUNT; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * RADIUS;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r * 0.6;
            const z = -Math.random() * DEPTH;
            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
            nodePts.push(new THREE.Vector3(x, y, z));
        }
        const pointsGeo = new THREE.BufferGeometry();
        pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const pointsMat = new THREE.PointsMaterial({
            color: 0x61e8f4,
            size: isSmallScreen ? 0.05 : 0.06,
            transparent: true,
            opacity: 0.85,
            sizeAttenuation: true
        });
        const points = new THREE.Points(pointsGeo, pointsMat);
        group.add(points);

        // ── Sparse connective lines between nearby nodes ────
        const MAX_LINKS = isSmallScreen ? 60 : 140;
        const LINK_DIST = 3.4;
        const linkPositions = [];
        outer:
        for (let i = 0; i < nodePts.length; i++) {
            for (let j = i + 1; j < nodePts.length; j++) {
                if (nodePts[i].distanceTo(nodePts[j]) < LINK_DIST) {
                    linkPositions.push(nodePts[i].x, nodePts[i].y, nodePts[i].z);
                    linkPositions.push(nodePts[j].x, nodePts[j].y, nodePts[j].z);
                    if (linkPositions.length / 6 >= MAX_LINKS) break outer;
                }
            }
        }
        const linesGeo = new THREE.BufferGeometry();
        linesGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linkPositions), 3));
        const linesMat = new THREE.LineBasicMaterial({
            color: 0x61e8f4,
            transparent: true,
            opacity: 0.18
        });
        const links = new THREE.LineSegments(linesGeo, linesMat);
        group.add(links);

        // ── Section-based color stops ───────────────────────
        // Reads live CSS variables so it always matches the theme.
        function readAccent(name, fallback) {
            const v = getComputedStyle(document.documentElement).getPropertyValue(name);
            return (v || fallback).trim();
        }
        function buildStops() {
            const palette = [
                readAccent('--accent-cyan', '#61e8f4'),
                readAccent('--accent-purple', '#9d8cff'),
                readAccent('--accent-green', '#69d7aa'),
                readAccent('--accent-amber', '#f2c46d'),
                readAccent('--accent-pink', '#ff7cad'),
                readAccent('--accent-cyan', '#61e8f4'),
                readAccent('--accent-amber', '#f2c46d'),
                readAccent('--accent-purple', '#9d8cff')
            ];
            const sections = Array.from(document.querySelectorAll('.story-section'));
            const docHeight = Math.max(document.body.scrollHeight - window.innerHeight, 1);
            return sections.map((el, i) => ({
                progress: Math.min(el.offsetTop / docHeight, 1),
                color: new THREE.Color(palette[i % palette.length])
            }));
        }
        let stops = buildStops();

        const currentColor = new THREE.Color(stops[0] ? stops[0].color : 0x61e8f4);
        function colorForProgress(p) {
            if (!stops.length) return currentColor;
            let a = stops[0], b = stops[stops.length - 1];
            for (let i = 0; i < stops.length - 1; i++) {
                if (p >= stops[i].progress && p <= stops[i + 1].progress) {
                    a = stops[i]; b = stops[i + 1];
                    break;
                }
            }
            const span = Math.max(b.progress - a.progress, 0.0001);
            const t = Math.min(Math.max((p - a.progress) / span, 0), 1);
            return currentColor.copy(a.color).lerp(b.color, t);
        }

        // ── Scroll progress (read on scroll, applied in rAF) ─
        let scrollProgress = 0;
        function readScroll() {
            const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
            scrollProgress = Math.min(Math.max(window.scrollY / max, 0), 1);
        }
        readScroll();
        window.addEventListener('scroll', readScroll, { passive: true });

        // ── Resize ───────────────────────────────────────────
        function resize() {
            renderer.setSize(window.innerWidth, window.innerHeight, false);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        }
        resize();
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                resize();
                stops = buildStops();
            }, 200);
        });
        window.addEventListener('load', () => { stops = buildStops(); });

        // ── Pointer parallax (desktop only) ─────────────────
        let targetX = 0, targetY = 0, curX = 0, curY = 0;
        if (!isSmallScreen && !reduceMotion) {
            window.addEventListener('mousemove', (e) => {
                targetX = (e.clientX / window.innerWidth - 0.5) * 0.8;
                targetY = (e.clientY / window.innerHeight - 0.5) * 0.5;
            }, { passive: true });
        }

        // ── Pause when tab hidden ────────────────────────────
        let isActive = true;
        document.addEventListener('visibilitychange', () => {
            isActive = !document.hidden;
        });

        // ── Theme swap re-tint ───────────────────────────────
        const themeObserver = new MutationObserver(() => { stops = buildStops(); });
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        const clock = new THREE.Clock();

        function applyFrame() {
            // Dolly the whole field forward as the page scrolls.
            camera.position.z = 10 - scrollProgress * DEPTH * 0.95;
            group.rotation.y = scrollProgress * 0.6;

            const c = colorForProgress(scrollProgress);
            pointsMat.color.copy(c);
            linesMat.color.copy(c);

            renderer.render(scene, camera);
        }

        function tick() {
            requestAnimationFrame(tick);
            if (!isActive) return;
            const dt = clock.getDelta();

            curX += (targetX - curX) * 0.04;
            curY += (targetY - curY) * 0.04;
            camera.position.x = curX * 1.2;
            camera.position.y = -curY * 0.8;

            if (!reduceMotion) {
                group.rotation.z += dt * 0.015;
            }

            applyFrame();
        }

        if (reduceMotion) {
            // Static + scroll-linked only: update on scroll, no idle animation loop.
            window.addEventListener('scroll', applyFrame, { passive: true });
            applyFrame();
        } else {
            tick();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScroll3D);
    } else {
        initScroll3D();
    }
})();
