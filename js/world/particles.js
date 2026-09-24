/**
 * Suspended Archival Dust & Cosmic Energy Particles
 * Multi-colored luminous particles floating through the corridor.
 */
import * as THREE from 'three';
import { state } from '../core/state.js';

export function createParticles(scene) {
  const count = state.isMobile ? 320 : 750;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // Palette: Gold, Cyan, Soft White
  const colorPalette = [
    new THREE.Color(0xf59e0b), // Solar Gold
    new THREE.Color(0x06b6d4), // Aurora Cyan
    new THREE.Color(0xfff9f1), // Soft Starlight
    new THREE.Color(0xb96542)  // Warm Copper
  ];

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 9 + 1.4;
    positions[i * 3 + 2] = 6 - Math.random() * 175;

    const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: state.isMobile ? 0.045 : 0.065,
    vertexColors: true,
    transparent: true,
    opacity: 0.72,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  function updateParticles(time) {
    particles.rotation.y = time * 0.00006;
    particles.position.y = Math.sin(time * 0.0004) * 0.15;
  }

  return {
    particles,
    updateParticles
  };
}
