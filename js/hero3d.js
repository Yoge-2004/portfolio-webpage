/* ============================================
   HERO 3D SCENE — orbital wireframe construct
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
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
        camera.position.z = 5.8;

        function readColors() {
            const cs = getComputedStyle(document.documentElement);
            const get = (name, fallback) => (cs.getPropertyValue(name) || fallback).trim();
            return {
                cyan: get('--accent-cyan', '#22f2ff'),
                purple: get('--accent-purple', '#8b5cf6'),
                pink: get('--accent-pink', '#ff1f7a'),
                amber: get('--accent-amber', '#ffb020')
            };
        }
        let colors = readColors();

        const shellGeo = new THREE.IcosahedronGeometry(1.72, 2);
        const shellMat = new THREE.LineBasicMaterial({ color: colors.cyan, transparent: true, opacity: 0.52 });
        const shell = new THREE.LineSegments(new THREE.WireframeGeometry(shellGeo), shellMat);
        scene.add(shell);

        const coreGeo = new THREE.IcosahedronGeometry(0.88, 2);
        const coreMat = new THREE.MeshBasicMaterial({ color: colors.purple, transparent: true, opacity: 0.10 });
        const core = new THREE.Mesh(coreGeo, coreMat);
        scene.add(core);
        const coreWireMat = new THREE.LineBasicMaterial({ color: colors.purple, transparent: true, opacity: 0.62 });
        const coreWire = new THREE.LineSegments(new THREE.WireframeGeometry(coreGeo), coreWireMat);
        scene.add(coreWire);

        const ringGeo = new THREE.TorusGeometry(2.18, 0.014, 8, 128);
        const ringMat = new THREE.MeshBasicMaterial({ color: colors.pink, transparent: true, opacity: 0.58 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.55;
        scene.add(ring);

        const ring2Geo = new THREE.TorusGeometry(1.82, 0.009, 8, 112);
        const ring2Mat = new THREE.MeshBasicMaterial({ color: colors.cyan, transparent: true, opacity: 0.34 });
        const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
        ring2.rotation.set(Math.PI / 3.2, Math.PI / 5, Math.PI / 8);
        scene.add(ring2);

        // Tiny satellites make the object feel like an actual spatial system.
        const satelliteGeo = new THREE.OctahedronGeometry(0.075, 0);
        const satellites = [];
        for (let i = 0; i < (isSmallScreen ? 3 : 5); i++) {
            const mat = new THREE.MeshBasicMaterial({ color: i % 2 ? colors.pink : colors.amber, transparent: true, opacity: .9 });
            const mesh = new THREE.Mesh(satelliteGeo, mat);
            mesh.userData = { radius: 2.25 + i * .17, phase: i * 1.27, speed: .28 + i * .045, tilt: (i - 2) * .16 };
            satellites.push(mesh);
            scene.add(mesh);
        }

        const particleCount = isSmallScreen ? 90 : 180;
        const particlePositions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const r = 2.2 + Math.random() * 2.1;
            const a = Math.random() * Math.PI * 2;
            particlePositions[i * 3] = Math.cos(a) * r;
            particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 4.2;
            particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4.2;
        }
        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        const particleMat = new THREE.PointsMaterial({ color: colors.cyan, size: isSmallScreen ? 0.032 : 0.042, transparent: true, opacity: 0.52, depthWrite: false });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        function applyColors() {
            colors = readColors();
            shellMat.color.set(colors.cyan);
            coreMat.color.set(colors.purple);
            coreWireMat.color.set(colors.purple);
            ringMat.color.set(colors.pink);
            ring2Mat.color.set(colors.cyan);
            particleMat.color.set(colors.cyan);
            satellites.forEach((m, i) => m.material.color.set(i % 2 ? colors.pink : colors.amber));
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
                targetX = (e.clientX / window.innerWidth - 0.5) * 0.82;
                targetY = (e.clientY / window.innerHeight - 0.5) * 0.58;
            }, { passive: true });
        }

        let isVisible = true;
        const section = document.getElementById('prologue');
        if (section && 'IntersectionObserver' in window) {
            const io = new IntersectionObserver((entries) => entries.forEach((entry) => { isVisible = entry.isIntersecting; }), { threshold: 0.05 });
            io.observe(section);
        }
        document.addEventListener('visibilitychange', () => { if (document.hidden) isVisible = false; });
        new MutationObserver(applyColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        const clock = new THREE.Clock();
        function renderStatic() {
            shell.rotation.set(.4, .6, 0);
            core.rotation.set(.2, .3, 0);
            coreWire.rotation.copy(core.rotation);
            ring.rotation.y = .4;
            ring2.rotation.x = .8;
            renderer.render(scene, camera);
        }

        function frameFn() {
            if (!isVisible) return;
            const dt = clock.getDelta();
            const t = clock.elapsedTime;
            curX += (targetX - curX) * .05;
            curY += (targetY - curY) * .05;

            shell.rotation.y += dt * .22;
            shell.rotation.x = curY + Math.sin(t * .22) * .10;
            shell.rotation.z = curX * .52;
            core.rotation.y -= dt * .38;
            core.rotation.x += dt * .13;
            coreWire.rotation.copy(core.rotation);
            ring.rotation.z += dt * .14;
            ring2.rotation.z -= dt * .10;
            ring2.rotation.y += dt * .07;
            particles.rotation.y -= dt * .035;
            particles.rotation.x = Math.sin(t * .12) * .08;

            satellites.forEach((mesh) => {
                const d = mesh.userData;
                const a = t * d.speed + d.phase;
                mesh.position.set(Math.cos(a) * d.radius, Math.sin(a * 1.25) * d.radius * .34, Math.sin(a) * d.radius * .72);
                mesh.rotation.x += dt * 1.5;
                mesh.rotation.y += dt * 2.0;
            });
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
            const rx = (.5 - py) * 5.5;
            const ry = (px - .5) * 7;
            el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
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
