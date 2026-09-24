/**
 * Industrial Overhead Structural Trusses & Ember Light Nodes (Arena)
 */
import * as THREE from 'three';
import { ARENA_TRUSS_STOPS, COLORS } from '../core/config.js';

export function createArenaTrusses(scene, getPathPoint, progressOfZ) {
  const trussGroup = new THREE.Group();

  ARENA_TRUSS_STOPS.forEach((tz, k) => {
    const tPt = getPathPoint(progressOfZ(tz));
    const beamGeo = new THREE.BoxGeometry(11, 0.22, 0.22);
    const beamMat = new THREE.MeshStandardMaterial({
      color: COLORS.bronze,
      roughness: 0.7,
      metalness: 0.6
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(tPt.x, 4.4, tz);
    trussGroup.add(beam);

    // Hanging Ember Light Node
    const emberLight = new THREE.PointLight(COLORS.ember, 1.6, 9, 2);
    emberLight.position.set(tPt.x + (k % 2 === 0 ? -2.2 : 2.2), 3.8, tz);
    trussGroup.add(emberLight);
  });

  scene.add(trussGroup);

  return { trussGroup };
}
