(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const q = (s,c=document) => c.querySelector(s);
  const qa = (s,c=document) => [...c.querySelectorAll(s)];
  const canvas = q('#novaCanvas');

  // New WebGL scene: a single abstract object whose form responds to scroll and pointer.
  if (canvas && window.THREE) {
    let renderer;
    try { renderer = new THREE.WebGLRenderer({canvas,alpha:true,antialias:!coarse,powerPreference:'high-performance'}); } catch(e) { renderer=null; }
    if (renderer) {
      const scene=new THREE.Scene();
      const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,100); camera.position.z=6;
      const group=new THREE.Group(); scene.add(group);
      const mat=(color,opacity=.7)=>new THREE.MeshBasicMaterial({color,wireframe:true,transparent:true,opacity});
      const outer=new THREE.Mesh(new THREE.IcosahedronGeometry(1.65,2),mat(0xd8ff43,.34));
      const inner=new THREE.Mesh(new THREE.IcosahedronGeometry(.82,2),mat(0x70d7ff,.45));
      const ring=new THREE.Mesh(new THREE.TorusGeometry(2.05,.012,8,160),new THREE.MeshBasicMaterial({color:0xd8ff43,transparent:true,opacity:.55}));
      ring.rotation.set(1.15,.2,.3); group.add(outer,inner,ring);
      const count=coarse?90:190, pos=new Float32Array(count*3);
      for(let i=0;i<count;i++){const r=2.4+Math.random()*2.3,a=Math.random()*Math.PI*2,b=(Math.random()-.5)*Math.PI;pos[i*3]=Math.cos(a)*Math.cos(b)*r;pos[i*3+1]=Math.sin(b)*r;pos[i*3+2]=Math.sin(a)*Math.cos(b)*r}
      const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));const dust=new THREE.Points(pg,new THREE.PointsMaterial({color:0x9aa09a,size:coarse?.035:.028,transparent:true,opacity:.28,depthWrite:false}));group.add(dust);
      let px=0,py=0,sx=0,sy=0,scroll=0;
      if(!coarse&&!reduced)addEventListener('pointermove',e=>{px=(e.clientX/innerWidth-.5)*.55;py=(e.clientY/innerHeight-.5)*.35},{passive:true});
      addEventListener('scroll',()=>scroll=scrollY/(document.documentElement.scrollHeight-innerHeight||1),{passive:true});
      const resize=()=>{renderer.setPixelRatio(Math.min(devicePixelRatio||1,coarse?1.5:2));renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()};resize();addEventListener('resize',resize,{passive:true});
      const clock=new THREE.Clock();
      const render=()=>{const t=clock.getElapsedTime();sx+=(px-sx)*.04;sy+=(py-sy)*.04;group.rotation.x=sy+scroll*.55;group.rotation.y=sx+t*.08+scroll*1.8;group.rotation.z=scroll*.35;outer.rotation.z=t*.06;inner.rotation.y=-t*.18;ring.rotation.z=t*.12+scroll*2;dust.rotation.y=-t*.015;renderer.render(scene,camera)};
      const loop=()=>{requestAnimationFrame(loop);render()}; if(reduced)render(); else loop();
    }
  }

  // Navigation and scroll progress.
  const progress=q('#novaProgress'); const update=()=>{const max=document.documentElement.scrollHeight-innerHeight; if(progress)progress.style.height=(max?scrollY/max*100:0)+'px'};addEventListener('scroll',update,{passive:true});update();
  qa('[data-scroll]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();q(a.dataset.scroll)?.scrollIntoView({behavior:reduced?'auto':'smooth'})}));
  q('#novaMenu')?.addEventListener('click',()=>q('#novaLinks')?.classList.toggle('is-open'));

  // Intro choreography and chapter reveals.
  if(window.gsap && window.ScrollTrigger){gsap.registerPlugin(ScrollTrigger);if(!reduced){gsap.from('.nova-kicker',{y:20,opacity:0,duration:.7,delay:.2});gsap.from('.nova-title span',{y:90,opacity:0,skewY:5,duration:1.1,stagger:.08,ease:'power4.out',delay:.3});gsap.from('.nova-hero-copy',{y:35,opacity:0,duration:.9,delay:.55});qa('.reveal').forEach(el=>gsap.to(el,{y:0,opacity:1,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 84%',once:true}}));qa('.nova-project-visual').forEach(el=>gsap.to(el,{yPercent:-8,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'bottom top',scrub:1.2}}));}}

  // Desktop-only magnetic cursor; deliberately absent on touch devices.
  if(!coarse&&!reduced){const cursor=q('#novaCursor');addEventListener('pointermove',e=>{if(cursor){cursor.style.display='block';cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'}});qa('.nova-btn,.nova-project').forEach(el=>{el.addEventListener('pointerenter',()=>cursor?.classList.add('hot'));el.addEventListener('pointerleave',()=>cursor?.classList.remove('hot'))})}
})();
