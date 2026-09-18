/**
 * 3D Neuro-Symbolic Feature Cluster (Discovery / Research Chamber)
 */
import * as THREE from 'three';
import { COLORS } from '../core/config.js';

export function createResearchCluster(scene) {
  const cluster = new THREE.Group();
  cluster.position.set(-2.8, 1.4, -42);

  // DistilBERT Polyhedron Core
  const coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
  const coreMat = new THREE.MeshStandardMaterial({
    color: COLORS.copper,
    emissive: 0x5a2310,
    wireframe: true,
    roughness: 0.3,
    metalness: 0.7
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  cluster.add(coreMesh);

  // Inner pulsing light
  const clusterLight = new THREE.PointLight(COLORS.copper, 3.2, 12, 2);
  cluster.add(clusterLight);

  // Isolation Forest Orbital Rings
  const ringGeo = new THREE.RingGeometry(1.3, 1.35, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: COLORS.brass,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6
  });
  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  const ring2 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 3;
  ring2.rotation.y = Math.PI / 4;
  cluster.add(ring1);
  cluster.add(ring2);

  scene.add(cluster);

  function updateResearchCluster(time) {
    coreMesh.rotation.x = time * 0.0006;
    coreMesh.rotation.y = time * 0.0009;
    ring1.rotation.z = time * 0.0004;
    ring2.rotation.x = time * 0.0005;
    clusterLight.intensity = 2.8 + Math.sin(time * 0.002) * 0.6;
  }

  return {
    cluster,
    updateResearchCluster
  };
}
