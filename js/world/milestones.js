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

    const beaconLight = new THREE.PointLight(COLORS.brass, 0, 5, 2);
    beaconLight.position.set(mPt.x, -1.3, mz);
    scene.add(beaconLight);

    milestoneNodes.push({ mesh: beacon, light: beaconLight, z: mz });
  });

  function updateMilestones(camZ) {
    milestoneNodes.forEach(node => {
      const dist = Math.abs(camZ - node.z);
      const hit = dist < 5.5;
      node.light.intensity = THREE.MathUtils.lerp(node.light.intensity, hit ? 3.0 : 0, 0.1);
    });
  }

  return {
    milestoneNodes,
    updateMilestones
  };
}
