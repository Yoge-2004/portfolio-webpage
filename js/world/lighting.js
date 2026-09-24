/**
 * Global and Dynamic Scene Lighting
 * Cinematic, high-contrast, multi-point atmospheric illumination.
 */
import * as THREE from 'three';
import { COLORS } from '../core/config.js';
import { state } from '../core/state.js';

export function createLighting(scene) {
  // 1. Ambient Fill with subtle warm undertone
  const ambient = new THREE.AmbientLight(0xfff5ea, 0.45);
  scene.add(ambient);

  // 2. Primary Directional Key Light (Solar Amber / Tungsten)
  const keyLight = new THREE.DirectionalLight(0xf59e0b, 2.6);
  keyLight.position.set(6, 12, 12);
  scene.add(keyLight);

  // 3. Cinematic Complementary Rim Light (Aurora Cyan / Teal)
  const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.9);
  rimLight.position.set(-8, 6, -15);
  scene.add(rimLight);

  // 4. Dynamic Camera-attached Travelling Spotlight
  const cameraSpot = new THREE.PointLight(
    COLORS.lightBrass,
    state.isMobile ? 5.5 : 8.5,
    32,
    2
  );
  scene.add(cameraSpot);

  // 5. Interactive Pointer Inspection Light (casts dynamic raking light on 3D surfaces)
  const pointerLight = new THREE.PointLight(
    0x22d3ee, // Luminous Cyan Inspection Beam
    state.isMobile ? 0 : 3.2,
    22,
    2
  );
  scene.add(pointerLight);

  // 6. Chamber-Specific Atmospheric Accent Lights
  // Research Chamber copper beacon (z: -42)
  const researchBeacon = new THREE.PointLight(COLORS.copper, 4.0, 28, 2);
  researchBeacon.position.set(-2.8, 3.5, -42);
  scene.add(researchBeacon);

  // Arena Chamber high-tension ember beacon (z: -98)
  const arenaBeacon = new THREE.PointLight(COLORS.ember, 4.5, 30, 2);
  arenaBeacon.position.set(0, 4.2, -98);
  scene.add(arenaBeacon);

  // Horizon Atrium radiant portal beacon (z: -160)
  const horizonBeacon = new THREE.PointLight(0xfff9f1, 5.5, 45, 1.8);
  horizonBeacon.position.set(0, 3.0, -160);
  scene.add(horizonBeacon);

  function updateLighting(camPos, smoothPtr) {
    cameraSpot.position.copy(camPos);

    if (smoothPtr && !state.isMobile) {
      pointerLight.position.set(
        camPos.x + (smoothPtr.x || 0) * 4.5,
        camPos.y + (smoothPtr.y || 0) * 3.0,
        camPos.z - 3.5
      );
    }
  }

  return {
    cameraSpot,
    pointerLight,
    keyLight,
    rimLight,
    ambient,
    updateLighting
  };
}
