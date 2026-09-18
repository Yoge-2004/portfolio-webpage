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

  // Aperture Void Rim
  const rimGeo = new THREE.RingGeometry(3.5, 3.7, 48);
  const rimMat = new THREE.MeshBasicMaterial({
    color: COLORS.brass,
    side: THREE.DoubleSide
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  rim.position.z = 0.35;
  horizonPortal.add(rim);

  // Radiant Horizon Tungsten Light
  const horizonLight = new THREE.PointLight(COLORS.lightBrass, 4.5, 36, 1.8);
  horizonLight.position.set(0, 0, -2);
  horizonPortal.add(horizonLight);

  scene.add(horizonPortal);

  return {
    horizonPortal,
    horizonLight
  };
}
