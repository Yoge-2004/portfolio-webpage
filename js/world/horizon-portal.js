/**
 * Monumental Horizon Gateway Aperture & Light (Contact Destination)
 */
import * as THREE from 'three';
import { COLORS } from '../core/config.js';

export function createHorizonPortal(scene) {
  const horizonPortal = new THREE.Group();
  horizonPortal.position.set(0, 1.5, -164);

  // Monumental Gateway Portal
  const portalGateGeo = new THREE.BoxGeometry(16, 12, 0.6);
  const portalGateMat = new THREE.MeshStandardMaterial({
    color: COLORS.void,
    roughness: 0.95
  });
  const portalGate = new THREE.Mesh(portalGateGeo, portalGateMat);
  horizonPortal.add(portalGate);

  // Concentric Aperture Rings
  const rimMat = new THREE.MeshBasicMaterial({
    color: COLORS.brass,
    side: THREE.DoubleSide
  });
  const innerRim = new THREE.Mesh(new THREE.RingGeometry(3.2, 3.35, 48), rimMat);
  innerRim.position.z = 0.35;
  horizonPortal.add(innerRim);

  const outerRim = new THREE.Mesh(new THREE.RingGeometry(4.4, 4.52, 64), rimMat);
  outerRim.position.z = 0.32;
  horizonPortal.add(outerRim);

  // Radiant Horizon Tungsten Light
  const horizonLight = new THREE.PointLight(COLORS.lightBrass, 4.5, 42, 1.8);
  horizonLight.position.set(0, 0, -2);
  horizonPortal.add(horizonLight);

  scene.add(horizonPortal);

  function updateHorizonPortal(time, camZ = 0) {
    innerRim.rotation.z = time * 0.0002;
    outerRim.rotation.z = -time * 0.00015;
    const isAtHorizon = camZ <= -140;
    const targetIntensity = isAtHorizon ? 6.5 + Math.sin(time * 0.002) * 0.8 : 3.5;
    horizonLight.intensity = THREE.MathUtils.lerp(horizonLight.intensity, targetIntensity, 0.08);
  }

  return {
    horizonPortal,
    horizonLight,
    updateHorizonPortal
  };
}
