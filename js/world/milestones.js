/**
 * Floor Rail Milestone Beacons (Path Progression)
 */
import * as THREE from 'three';
import { COLORS, MILESTONE_Z_STOPS } from '../core/config.js';

export function createMilestones(scene, getPathPoint, progressOfZ) {
  const milestoneNodes = [];

  MILESTONE_Z_STOPS.forEach(mz => {
    const mPt = getPathPoint(progressOfZ(mz));
    const beaconGeo = new THREE.BoxGeometry(0.18, 0.45, 0.18);
    const beaconMat = new THREE.MeshStandardMaterial({
      color: COLORS.bronze,
      roughness: 0.4,
      metalness: 0.8
    });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(mPt.x, -1.6, mz);
    scene.add(beacon);

    // Emissive Beacon Cap
    const capGeo = new THREE.BoxGeometry(0.19, 0.06, 0.19);
    const capMat = new THREE.MeshStandardMaterial({
      color: COLORS.brass,
      emissive: COLORS.brass,
      emissiveIntensity: 0.2,
      roughness: 0.2,
      metalness: 0.9
    });
    const capMesh = new THREE.Mesh(capGeo, capMat);
    capMesh.position.set(mPt.x, -1.35, mz);
    scene.add(capMesh);

    const beaconLight = new THREE.PointLight(COLORS.brass, 0, 5.5, 2);
    beaconLight.position.set(mPt.x, -1.2, mz);
    scene.add(beaconLight);

    milestoneNodes.push({ mesh: beacon, cap: capMesh, light: beaconLight, z: mz });
  });

  function updateMilestones(camZ) {
    milestoneNodes.forEach(node => {
      const dist = Math.abs(camZ - node.z);
      const hit = dist < 6.0;
      const targetIntensity = hit ? 3.5 : 0;
      const targetEmissive = hit ? 1.8 : 0.2;
      node.light.intensity = THREE.MathUtils.lerp(node.light.intensity, targetIntensity, 0.12);
      node.cap.material.emissiveIntensity = THREE.MathUtils.lerp(node.cap.material.emissiveIntensity, targetEmissive, 0.12);
    });
  }

  return {
    milestoneNodes,
    updateMilestones
  };
}
