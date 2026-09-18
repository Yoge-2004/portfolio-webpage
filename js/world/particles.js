/**
 * Suspended Archival Dust Particles
 */
import * as THREE from 'three';
import { COLORS, ENVIRONMENT_CONFIG } from '../core/config.js';
import { state } from '../core/state.js';

export function createParticles(scene) {
  const count = ENVIRONMENT_CONFIG.getParticleCount(state.isMobile);
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8 + 1.2;
    positions[i * 3 + 2] = 4 - Math.random() * 165;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMat = new THREE.PointsMaterial({
    color: COLORS.brass,
    size: state.isMobile ? 0.03 : 0.045,
    transparent: true,
    opacity: 0.45
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  function updateParticles(time) {
    particles.rotation.y = time * 0.00008;
  }

  return {
    particles,
    updateParticles
  };
}
