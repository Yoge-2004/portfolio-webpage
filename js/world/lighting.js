/**
 * Global and Dynamic Scene Lighting
 */
import * as THREE from 'three';
import { COLORS } from '../core/config.js';
import { state } from '../core/state.js';

export function createLighting(scene) {
  // Ambient fill
  const ambient = new THREE.AmbientLight(0xfff5ea, 0.35);
  scene.add(ambient);

  // Dynamic Camera-attached Spotlight
  const cameraSpot = new THREE.PointLight(
    COLORS.lightBrass,
    state.isMobile ? 4.8 : 7.2,
    26,
    2
  );
  scene.add(cameraSpot);

  // Distant warm tungsten/copper side fill
  const warmSide = new THREE.PointLight(COLORS.copper, 2.5, 45, 2);
  warmSide.position.set(-4, 7, 8);
  scene.add(warmSide);

  function updateLighting(camPos) {
    cameraSpot.position.copy(camPos);
  }

  return {
    cameraSpot,
    warmSide,
    updateLighting
  };
}
