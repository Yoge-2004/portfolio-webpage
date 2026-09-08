/* ============================================
   HERO 3D SCENE — rotating wireframe construct
   Responsive, theme-aware and GPU-conscious.
   ============================================ */
(function () {
    'use strict';

    function initHero3D() {
        const canvas = document.getElementById('hero3d');
        if (!canvas || typeof THREE === 'undefined') return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isSmallScreen = window.innerWidth < 640;

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isSmallScreen, powerPreference: 'high-performance' });
        } catch (e) { return; }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmallScreen ? 1.5 : 2));
        renderer.setClearColor(0x000000, 0);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.z = 5.4;

        function readColors() {
            const cs = getComputedStyle(document.documentElement);
            const get = (name, fallback) => (cs.getPropertyValue(name) || fallback).trim();
            return { cyan: get('--accent-cyan', '#22f2ff'), purple: get('--accent-purple', '#8b5cf6'), pink: get('--accent-pink', '#ff1f7a') };
        }
        let colors = readColors();

        const shellGeo = new THREE.IcosahedronGeometry(1.7, 1);
        const shellMat = new THREE.LineBasicMaterial({ color: colors.cyan, transparent: true, opacity: 0.55 });
        const shell = new THREE.LineSegments(new THREE.WireframeGeometry(shellGeo), shellMat);
        scene.add(shell);

        const coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
        const coreMat = new THREE.MeshBasicMaterial({ color: colors.purple, transparent: true, opacity: 0.12 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        scene.add(core);

        const coreWireMat = new THREE.LineBasicMaterial({ color: colors.purple, transparent: true, opacity: 0.42 });
        const coreWire = new THREE.LineSegments(new THREE.WireframeGeometry(coreGeo), coreWireMat);
        scene.add(coreWire);

        const ringGeo = new THREE.TorusGeometry(2.25, 0.012, 8, 96);
        const ringMat = new THREE.MeshBasicMaterial({ color: colors.pink, transparent: true, opacity: 0.5 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.6;
        scene.add(ring);

        // Fine particle halo adds depth without requiring textures.
        const particleCount = isSmallScreen ? 70 : 140;
        const particlePositions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const r = 2.3 + Math.random() * 1.7;
            const a = Math.random() * Math.PI * 2;
            particlePositions[i * 3] = Math.cos(a) * r;
            particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 3.6;
            particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3.6;
        }
        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        const particleMat = new THREE.PointsMaterial({ color: colors.cyan, size: isSmallScreen ? 0.035 : 0.045, transparent: true, opacity: 0.55, depthWrite: false });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        function applyColors() {
            colors = readColors();
            shellMat.color.set(colors.cyan);
            coreMat.color.set(colors.purple);
            coreWireMat.color.set(colors.purple);
            ringMat.color.set(colors.pink);
            particleMat.color.set(colors.cyan);
        }

        function resize() {
            const wrapper = canvas.parentElement;
            const w = wrapper.clientWidth || 360;
            const h = wrapper.clientHeight || 460;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        let targetX = 0, targetY = 0, curX = 0, curY = 0;
        if (!isSmallScreen && !reduceMotion) {
            window.addEventListener('pointermove', (e) => {
                targetX = (e.clientX / window.innerWidth - 0.5) * 0.75;
                targetY = (e.clientY / window.innerHeight - 0.5) * 0.5;
            }, { passive: true });
        }

        let isVisible = true;
        const section = document.getElementById('prologue');
        if (section && 'IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => entries.forEach((entry) => { isVisible = entry.isIntersecting; }), { threshold: 0.05 });
            io.observe(section);
        }
        document.addEventListener('visibilitychange', () => { if (document.hidden) isVisible = false; });

        const themeObserver = new MutationObserver(applyColors);
        themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        const clock = new THREE.Clock();
        function renderStatic() {
            shell.rotation.set(0.4, 0.6, 0);
            core.rotation.set(0.2, 0.3, 0);
            coreWire.rotation.copy(core.rotation);
            ring.rotation.y = 0.4;
            renderer.render(scene, camera);
        }

        function frameFn() {
            if (!isVisible) return;
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
            particles.rotation.y -= dt * 0.025;
            renderer.render(scene, camera);
        }

        if (reduceMotion) renderStatic();
        else if (window.RenderLoop) window.RenderLoop.register(frameFn);
        else (function tick() { requestAnimationFrame(tick); frameFn(); })();
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHero3D);
    else initHero3D();
})();

/* Card/hero pointer tilt — disabled on touch and reduced-motion devices. */
(function () {
    'use strict';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (reduceMotion || touch) return;

    const selectors = ['.project-card', '.quest-card', '.battle-card', '.credential-card', '.contact-card', '.origin-card', '.timeline-entry__card', '.research-paper'];

    function attach(el) {
        if (el.dataset.tiltReady) return;
        el.dataset.tiltReady = '1';
        let raf = 0, px = .5, py = .5;
        const render = () => {
            raf = 0;
            const rx = (.5 - py) * 4.5;
            const ry = (px - .5) * 6;
            el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
        };
        el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            px = (e.clientX - r.left) / r.width;
            py = (e.clientY - r.top) / r.height;
            if (!raf) raf = requestAnimationFrame(render);
        }, { passive: true });
        el.addEventListener('pointerleave', () => {
            if (raf) cancelAnimationFrame(raf);
            raf = 0;
            el.style.transform = '';
        });
    }

    function init() { selectors.forEach((s) => document.querySelectorAll(s).forEach(attach)); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
