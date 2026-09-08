/* MAGNETIC INTERACTION — single, restrained pointer system */
(function(){'use strict';
function init(){if(typeof gsap==='undefined'||matchMedia('(pointer:coarse)').matches||matchMedia('(prefers-reduced-motion:reduce)').matches)return;document.querySelectorAll('.btn').forEach(btn=>{btn.addEventListener('pointermove',e=>{const r=btn.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))*.18,y=(e.clientY-(r.top+r.height/2))*.18;gsap.to(btn,{x:Math.max(-12,Math.min(12,x)),y:Math.max(-12,Math.min(12,y)),duration:.35,ease:'power3.out',overwrite:true})},{passive:true});btn.addEventListener('pointerleave',()=>gsap.to(btn,{x:0,y:0,duration:.45,ease:'power3.out',overwrite:true}),{passive:true})})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
