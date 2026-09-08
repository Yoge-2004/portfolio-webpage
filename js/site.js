(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('scene');
  if (!canvas || !window.THREE) return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, .1, 100);
  camera.position.set(0, 0, 8);

  const world = new THREE.Group();
  scene.add(world);
  scene.add(new THREE.AmbientLight(0xffffff, .18));
  const key = new THREE.PointLight(0xd6ff3f, 18, 18); key.position.set(3, 2, 4); scene.add(key);
  const rim = new THREE.PointLight(0x8a8f83, 10, 16); rim.position.set(-4, -3, 2); scene.add(rim);

  const field = new THREE.Group();
  const points = [];
  for (let i = 0; i < 420; i++) {
    const r = 4 + Math.random() * 7;
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random() - .5) * 8;
    points.push(Math.cos(a) * r, y, Math.sin(a) * r);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const pm = new THREE.PointsMaterial({ color: 0xc7cfb0, size: .018, transparent: true, opacity: .48 });
  field.add(new THREE.Points(pg, pm));
  world.add(field);

  const geometry = new THREE.IcosahedronGeometry(1.75, 2);
  const wire = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0xd6ff3f, wireframe: true, transparent: true, opacity: .27 }));
  const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(1.38, 2), new THREE.MeshBasicMaterial({ color: 0xe9e7df, wireframe: true, transparent: true, opacity: .08 }));
  world.add(wire, inner);

  const ringGroup = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.35 + i * .28, .008 + i * .003, 8, 160), new THREE.MeshBasicMaterial({ color: i === 0 ? 0xd6ff3f : 0x7c8275, transparent: true, opacity: .42 - i * .1 }));
    ring.rotation.set(i * .7, i * .45, i * .3); ringGroup.add(ring);
  }
  world.add(ringGroup);

  const target = { x: 0, y: 0, scroll: 0 };
  let scroll = 0;
  addEventListener('pointermove', e => { target.x = (e.clientX / innerWidth - .5) * 2; target.y = (e.clientY / innerHeight - .5) * 2; });
  addEventListener('scroll', () => { scroll = scrollY / Math.max(1, document.body.scrollHeight - innerHeight); }, { passive: true });

  function resize() { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8)); }
  addEventListener('resize', resize);

  let t = 0;
  function render() {
    t += .006;
    const motion = reduce ? 0 : 1;
    wire.rotation.x += .0018 * motion; wire.rotation.y += .0028 * motion;
    inner.rotation.x -= .0012 * motion; inner.rotation.y -= .002 * motion;
    ringGroup.rotation.z += .0015 * motion;
    field.rotation.y += .00035 * motion;
    const sx = target.x * .28, sy = target.y * .16;
    world.rotation.y += (sx + scroll * 1.3 - world.rotation.y) * .025;
    world.rotation.x += (-sy + scroll * .35 - world.rotation.x) * .025;
    world.position.y += (-scroll * 2.5 - world.position.y) * .018;
    camera.position.x += (target.x * .22 - camera.position.x) * .02;
    camera.position.y += (-target.y * .12 - camera.position.y) * .02;
    camera.lookAt(world.position.x, world.position.y, world.position.z);
    key.position.x = 3 + Math.sin(t) * 1.2;
    key.position.y = 2 + Math.cos(t * .8);
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  if (!reduce && window.IntersectionObserver) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('seen'); }), { threshold: .12 });
    document.querySelectorAll('.section, .project, .number-grid>div, .timeline-list>div').forEach(el => observer.observe(el));
  }
})();
