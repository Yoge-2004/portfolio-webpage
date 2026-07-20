/* ============================================
   HERO 3D SCENE — rotating wireframe construct
   Vendored Three.js (js/vendor/three.min.js)
   Sits behind the portrait frame as a decorative,
   theme-aware, auto-rotating 3D object.
   ============================================ */
(function () {
    'use strict';

    function initHero3D() {
        const canvas = document.getElementById('hero3d');
        if (!canvas || typeof THREE === 'undefined') return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isSmallScreen = window.innerWidth < 640;

        // ── Feature detect WebGL ──────────────────────────
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: !isSmallScreen,
                powerPreference: 'high-performance'
            });
        } catch (e) {
            return; // no WebGL — canvas just stays empty/hidden
        }
        if (!renderer) return;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.z = 5.4;

        // ── Read theme colors from CSS variables ──────────
        function readColors() {
            const cs = getComputedStyle(document.documentElement);
            const get = (name, fallback) => (cs.getPropertyValue(name) || fallback).trim();
            return {
                cyan: get('--accent-cyan', '#61e8f4'),
                purple: get('--accent-purple', '#9d8cff'),
                pink: get('--accent-pink', '#ff7cad')
            };
        }
        let colors = readColors();

        // ── Outer wireframe shell (icosahedron) ───────────
        const shellGeo = new THREE.IcosahedronGeometry(1.7, 1);
        const shellWire = new THREE.WireframeGeometry(shellGeo);
        const shellMat = new THREE.LineBasicMaterial({
            color: colors.cyan,
            transparent: true,
            opacity: 0.55
        });
        const shell = new THREE.LineSegments(shellWire, shellMat);
        scene.add(shell);

        // ── Inner glimmering core ─────────────────────────
        const coreGeo = new THREE.IcosahedronGeometry(0.85, 0);
        const coreMat = new THREE.MeshBasicMaterial({
            color: colors.purple,
            transparent: true,
            opacity: 0.16,
            wireframe: false
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        scene.add(core);

        const coreWireMat = new THREE.LineBasicMaterial({
            color: colors.purple,
            transparent: true,
            opacity: 0.4
        });
        const coreWire = new THREE.LineSegments(new THREE.WireframeGeometry(coreGeo), coreWireMat);
        scene.add(coreWire);

        // ── Orbiting accent ring ───────────────────────────
        const ringGeo = new THREE.TorusGeometry(2.25, 0.012, 8, 96);
        const ringMat = new THREE.MeshBasicMaterial({
            color: colors.pink,
            transparent: true,
            opacity: 0.5
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.6;
        scene.add(ring);

        function applyColors() {
            colors = readColors();
            shellMat.color.set(colors.cyan);
            coreMat.color.set(colors.purple);
            coreWireMat.color.set(colors.purple);
            ringMat.color.set(colors.pink);
        }

        // ── Sizing ─────────────────────────────────────────
        function resize() {
            const wrapper = canvas.parentElement;
            const w = wrapper.clientWidth || 360;
            const h = wrapper.clientHeight || 460;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        resize();
        window.addEventListener('resize', resize);

        // ── Pointer parallax (lerped, additive to auto-rotation) ─
        let targetX = 0, targetY = 0, curX = 0, curY = 0;
        if (!isSmallScreen && !reduceMotion) {
            window.addEventListener('mousemove', (e) => {
                targetX = (e.clientX / window.innerWidth - 0.5) * 0.6;
                targetY = (e.clientY / window.innerHeight - 0.5) * 0.4;
            }, { passive: true });
        }

        // ── Visibility gating: pause when off-screen / tab hidden ──
        let isVisible = true;
        const section = document.getElementById('prologue');
        if (section && 'IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => { isVisible = entry.isIntersecting; });
            }, { threshold: 0.05 });
            io.observe(section);
        }
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) isVisible = false;
        });

        // ── Theme change watcher ───────────────────────────
        const themeObserver = new MutationObserver(applyColors);
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        // ── Render loop ─────────────────────────────────────
        const clock = new THREE.Clock();
        let frameCount = 0;

        function renderStatic() {
            // Reduced-motion fallback: one still frame, gently posed.
            shell.rotation.set(0.4, 0.6, 0);
            core.rotation.set(0.2, 0.3, 0);
            coreWire.rotation.copy(core.rotation);
            ring.rotation.y = 0.4;
            renderer.render(scene, camera);
        }

        function tick() {
            requestAnimationFrame(tick);
            if (!isVisible) return;

            frameCount++;
            const dt = clock.getDelta();

            curX += (targetX - curX) * 0.05;
            curY += (targetY - curY) * 0.05;

            shell.rotation.y += dt * 0.18;
            shell.rotation.x = curY + Math.sin(clock.elapsedTime * 0.2) * 0.08;
            shell.rotation.z = curX * 0.5;

            core.rotation.y -= dt * 0.32;
            core.rotation.x += dt * 0.12;
            coreWire.rotation.copy(core.rotation);

            ring.rotation.z += dt * 0.1;

            renderer.render(scene, camera);
        }

        if (reduceMotion) {
            resize();
            renderStatic();
        } else {
            tick();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHero3D);
    } else {
        initHero3D();
    }
})();
