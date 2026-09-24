/**
 * Architectural Corridor Environment: Floor Grid, Brass Rail, and Structural Columns
 */
import * as THREE from 'three';
import { COLORS, ENVIRONMENT_CONFIG } from '../core/config.js';
import { state } from '../core/state.js';

export function createEnvironment(scene, getPathPoint, progressOfZ) {
  const segments = ENVIRONMENT_CONFIG.getSegments(state.isMobile);
  const totalLength = ENVIRONMENT_CONFIG.totalLength;
  const segLen = totalLength / segments;

  // Floor Grid with Central Brass Tracking Rail
  const floorMat = new THREE.MeshStandardMaterial({
    roughness: 0.9,
    metalness: 0.08,
    color: 0x14100c
  });
  const floorMesh = new THREE.InstancedMesh(
    new THREE.PlaneGeometry(segLen, 14),
    floorMat,
    segments
  );
  floorMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(segments * 3), 3);

  // Central Brass Guide Rail
  const railMat = new THREE.MeshStandardMaterial({
    roughness: 0.35,
    metalness: 0.85,
    color: COLORS.brass
  });
  const railMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.08, 0.04, segLen),
    railMat,
    segments
  );

  // Flanking Architectural Portal Beams
  const portalMat = new THREE.MeshStandardMaterial({
    roughness: 0.88,
    metalness: 0.12,
    color: COLORS.graphite
  });
  const portalCols = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.35, 7.5, 0.4),
    portalMat,
    segments * 2
  );

  const dummy = new THREE.Object3D();
  const floorCol = new THREE.Color(0x18130e);

  for (let i = 0; i < segments; i++) {
    const z = 4 - i * segLen;
    const pt = getPathPoint(progressOfZ(z));

    // Floor Slabs
    dummy.position.set(pt.x, -1.85, z);
    dummy.rotation.set(-Math.PI / 2, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    floorMesh.setMatrixAt(i, dummy.matrix);
    floorMesh.setColorAt(i, floorCol);

    // Central Guide Rail
    dummy.position.set(pt.x, -1.82, z);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    railMesh.setMatrixAt(i, dummy.matrix);

    // Structural Pillars
    const halfWidth = 5.2 + Math.sin(i * 0.18) * 0.8;
    [-1, 1].forEach((side, sIdx) => {
      const colIdx = i * 2 + sIdx;
      dummy.position.set(pt.x + side * halfWidth, 1.8, z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      portalCols.setMatrixAt(colIdx, dummy.matrix);
    });
  }

  floorMesh.instanceMatrix.needsUpdate = true;
  floorMesh.instanceColor.needsUpdate = true;
  railMesh.instanceMatrix.needsUpdate = true;
  portalCols.instanceMatrix.needsUpdate = true;

  scene.add(floorMesh);
  scene.add(railMesh);
  scene.add(portalCols);

  return {
    floorMesh,
    railMesh,
    portalCols
  };
}
