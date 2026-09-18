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

  // Interactive Pointer Inspection Light (casts dynamic raking light on 3D surfaces)
  const pointerLight = new THREE.PointLight(
    COLORS.brass,
    state.isMobile ? 0 : 2.4,
    18,
    2
  );
  scene.add(pointerLight);

  // Distant warm tungsten/copper side fill
  const warmSide = new THREE.PointLight(COLORS.copper, 2.5, 45, 2);
  warmSide.position.set(-4, 7, 8);
  scene.add(warmSide);

  function updateLighting(camPos, smoothPtr) {
    cameraSpot.position.copy(camPos);
    if (smoothPtr && !state.isMobile) {
      pointerLight.position.set(
        camPos.x + (smoothPtr.x || 0) * 4.0,
        camPos.y + (smoothPtr.y || 0) * 2.5,
        camPos.z - 3.2
      );
    }
  }

  return {
    cameraSpot,
    pointerLight,
    warmSide,
    ambient,
    updateLighting
  };
}
