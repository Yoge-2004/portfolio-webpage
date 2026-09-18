/**
 * WebGLRenderer Configuration & Lifecycle
 */
import * as THREE from 'three';
import { state } from '../core/state.js';

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !state.isMobile,
    powerPreference: 'high-performance'
  });

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, state.isMobile ? 1.4 : 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  function handleResize(camera, composer) {
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, state.isMobile ? 1.4 : 2));
    renderer.setSize(innerWidth, innerHeight, false);
    if (composer) composer.setSize(innerWidth, innerHeight);
    if (camera) {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    }
  }

  return {
    renderer,
    handleResize
  };
}
