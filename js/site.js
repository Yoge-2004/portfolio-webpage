(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('scene');
  const menu = document.querySelector('.menu-toggle');
  const masthead = document.querySelector('.masthead');
  const nav = document.getElementById('primary-nav');
  if (menu && masthead && nav) {
    menu.addEventListener('click', () => {
      const open = masthead.classList.toggle('nav-open');
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      masthead.classList.remove('nav-open'); menu.setAttribute('aria-expanded','false');
    }));
  }
  const revealAll = () => document.querySelectorAll('.reveal').forEach(el => el.classList.add('seen'));
  if (window.IntersectionObserver && !reduce) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('seen'); io.unobserve(entry.target); }
    }), { threshold: .12, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else revealAll();
  if (!canvas || !window.THREE) return;

  try {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(innerWidth, innerHeight, false);
    if ('outputEncoding' in renderer) renderer.outputEncoding = THREE.sRGBEncoding;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, .1, 60);
    camera.position.set(0, 0, 8);
    const world = new THREE.Group(); scene.add(world);
    scene.add(new THREE.AmbientLight(0xffffff, .22));
    const key = new THREE.PointLight(0xd6ff3f, 12, 18); key.position.set(3,2,4); scene.add(key);
    const rim = new THREE.PointLight(0x9da391, 7, 15); rim.position.set(-4,-2,2); scene.add(rim);

    const pts = [];
    for (let i=0;i<260;i++) { const r=4+Math.random()*6,a=Math.random()*Math.PI*2; pts.push(Math.cos(a)*r,(Math.random()-.5)*7,Math.sin(a)*r); }
    const pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));
    const stars=new THREE.Points(pg,new THREE.PointsMaterial({color:0xd8dccd,size:.022,transparent:true,opacity:.42})); world.add(stars);

    const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(1.65,2),new THREE.MeshBasicMaterial({color:0xd6ff3f,wireframe:true,transparent:true,opacity:.25}));
    const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(1.28,1),new THREE.MeshBasicMaterial({color:0xe9e7df,wireframe:true,transparent:true,opacity:.1})); world.add(outer,inner);
    const rings=new THREE.Group();
    [2.2,2.55,2.9].forEach((radius,i)=>{const r=new THREE.Mesh(new THREE.TorusGeometry(radius,.009+i*.002,8,128),new THREE.MeshBasicMaterial({color:i===0?0xd6ff3f:0x7b8174,transparent:true,opacity:.36-i*.08}));r.rotation.set(i*.55,i*.8,i*.35);rings.add(r);});
    world.add(rings);

    let pointerX=0,pointerY=0,targetScroll=0,currentScroll=0,t=0;
    addEventListener('pointermove',e=>{pointerX=(e.clientX/innerWidth-.5);pointerY=(e.clientY/innerHeight-.5);},{passive:true});
    addEventListener('scroll',()=>{targetScroll=scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);},{passive:true});
    const resize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);}; addEventListener('resize',resize);

    const animate=()=>{
      t+=.005; currentScroll += (targetScroll-currentScroll)*.045;
      const motion=reduce?0:1;
      outer.rotation.x+=.0014*motion; outer.rotation.y+=.0024*motion; inner.rotation.x-=.001*motion; inner.rotation.y-=.0018*motion; rings.rotation.z+=.0012*motion; stars.rotation.y+=.00025*motion;
      world.rotation.y += (pointerX*.25 + currentScroll*1.15 - world.rotation.y)*.025;
      world.rotation.x += (-pointerY*.12 + currentScroll*.25 - world.rotation.x)*.025;
      world.position.y += (-currentScroll*2.0-world.position.y)*.018;
      camera.position.x += (pointerX*.18-camera.position.x)*.02;
      camera.position.y += (-pointerY*.1-camera.position.y)*.02;
      camera.lookAt(0,world.position.y,0);
      key.position.x=3+Math.sin(t)*1.2; key.position.y=2+Math.cos(t*.8);
      renderer.render(scene,camera); requestAnimationFrame(animate);
    };
    animate();
  } catch (error) {
    canvas.style.display='none';
    console.warn('WebGL enhancement disabled:', error);
  }
})();
