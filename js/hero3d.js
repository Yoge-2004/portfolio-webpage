/* HERO 3D — restrained spatial sculpture */
(function(){'use strict';
function init(){
 const canvas=document.getElementById('hero3d'); if(!canvas||typeof THREE==='undefined')return;
 const small=innerWidth<640, reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let renderer; try{renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!small,powerPreference:'high-performance'});}catch(e){return}
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,small?1.5:2));renderer.setClearColor(0,0);
 const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.z=6.2;
 const root=new THREE.Group();scene.add(root);
 const cyan=new THREE.Color('#61e8f4'), violet=new THREE.Color('#9d8cff'), warm=new THREE.Color('#f2c46d');
 const shell=new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.65,2)),new THREE.LineBasicMaterial({color:cyan,transparent:true,opacity:.45}));root.add(shell);
 const core=new THREE.Mesh(new THREE.IcosahedronGeometry(.78,2),new THREE.MeshBasicMaterial({color:violet,wireframe:true,transparent:true,opacity:.55}));root.add(core);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.05,.012,8,128),new THREE.MeshBasicMaterial({color:warm,transparent:true,opacity:.6}));ring.rotation.set(Math.PI/2.4,.2,0);root.add(ring);
 const dots=[];const geo=new THREE.OctahedronGeometry(.055,0);
 for(let i=0;i<(small?4:7);i++){const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:i%2?violet:cyan,transparent:true,opacity:.85}));m.userData={r:2.1+i*.16,p:i*1.31,s:.25+i*.035};root.add(m);dots.push(m)}
 const positions=new Float32Array((small?70:130)*3);for(let i=0;i<positions.length;i+=3){const a=Math.random()*Math.PI*2,r=2.2+Math.random()*2;positions[i]=Math.cos(a)*r;positions[i+1]=(Math.random()-.5)*3.4;positions[i+2]=(Math.random()-.5)*3.4}
 const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(positions,3));const particles=new THREE.Points(pg,new THREE.PointsMaterial({color:cyan,size:small?.03:.04,transparent:true,opacity:.42,depthWrite:false}));root.add(particles);
 function resize(){const w=canvas.parentElement?.clientWidth||360,h=canvas.parentElement?.clientHeight||460;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}resize();addEventListener('resize',resize,{passive:true});
 let tx=0,ty=0,cx=0,cy=0;if(!small&&!reduce)addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*.55;ty=(e.clientY/innerHeight-.5)*.4},{passive:true});
 let visible=true;const sec=document.getElementById('prologue');if(sec&&'IntersectionObserver'in window)new IntersectionObserver(es=>visible=es[0].isIntersecting,{threshold:.02}).observe(sec);
 const clock=new THREE.Clock();function frame(){if(!visible)return;const dt=clock.getDelta(),t=clock.elapsedTime;cx+=(tx-cx)*.04;cy+=(ty-cy)*.04;root.rotation.y=cx+Math.sin(t*.18)*.05;root.rotation.x=cy; shell.rotation.z+=dt*.12;core.rotation.y-=dt*.3;ring.rotation.z+=dt*.16;particles.rotation.y-=dt*.025;dots.forEach(d=>{const u=d.userData,a=t*u.s+u.p;d.position.set(Math.cos(a)*u.r,Math.sin(a*1.3)*u.r*.3,Math.sin(a)*u.r*.7);d.rotation.x+=dt;d.rotation.y+=dt*1.4});renderer.render(scene,camera)}
 if(reduce)frame();else if(window.RenderLoop)RenderLoop.register(frame);else{(function loop(){requestAnimationFrame(loop);frame()})()}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
