/**
 * 3D Neuro-Symbolic Feature Cluster (Discovery / Research Chamber)
 */
import * as THREE from 'three';
import { COLORS } from '../core/config.js';

export function createResearchCluster(scene) {
  const cluster = new THREE.Group();
  cluster.position.set(-2.8, 1.4, -42);

  // 1. DistilBERT Wireframe Polyhedron
  const coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
  const coreMat = new THREE.MeshStandardMaterial({
    color: COLORS.copper,
    emissive: 0x5a2310,
    wireframe: true,
    roughness: 0.25,
    metalness: 0.8
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  cluster.add(coreMesh);

  // 2. Inner Solid Faceted Nucleus
  const nucleusGeo = new THREE.DodecahedronGeometry(0.48);
  const nucleusMat = new THREE.MeshStandardMaterial({
    color: COLORS.brass,
    emissive: 0x3d280e,
    roughness: 0.35,
    metalness: 0.9
  });
  const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
  cluster.add(nucleusMesh);

  // 3. Inner Pulsing Volumetric Light
  const clusterLight = new THREE.PointLight(COLORS.copper, 3.2, 14, 2);
  cluster.add(clusterLight);

  // 4. Isolation Forest Orbital Rings (3 counter-rotating rings)
  const ringMat = new THREE.MeshBasicMaterial({
    color: COLORS.brass,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.55
  });
  const ring1 = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.29, 36), ringMat);
  const ring2 = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.54, 40), ringMat);
  const ring3 = new THREE.Mesh(new THREE.RingGeometry(1.78, 1.82, 48), ringMat);
  ring1.rotation.x = Math.PI / 3;
  ring2.rotation.y = Math.PI / 4;
  ring3.rotation.z = Math.PI / 6;
  cluster.add(ring1);
  cluster.add(ring2);
  cluster.add(ring3);

  // 5. Semantic Vector Feature Nodes (6 floating satellite pips)
  const nodeGeo = new THREE.BoxGeometry(0.07, 0.07, 0.07);
  const nodeMat = new THREE.MeshBasicMaterial({ color: COLORS.lightBrass });
  const nodes = [];
  for (let i = 0; i < 6; i++) {
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    const angle = (i / 6) * Math.PI * 2;
    const rad = 2.05 + (i % 2) * 0.35;
    node.position.set(Math.cos(angle) * rad, Math.sin(angle) * rad * 0.6, Math.sin(angle * 2) * 0.4);
    cluster.add(node);
    nodes.push({ mesh: node, baseAngle: angle, rad });
  }

  scene.add(cluster);

  function updateResearchCluster(time, camZ = 0) {
    const dist = Math.abs(camZ - -42);
    const proximity = THREE.MathUtils.clamp(1 - dist / 14, 0, 1);
    const speedMult = 1 + proximity * 1.8;

    coreMesh.rotation.x = time * 0.0006 * speedMult;
    coreMesh.rotation.y = time * 0.0009 * speedMult;
    nucleusMesh.rotation.x = -time * 0.0008 * speedMult;
    nucleusMesh.rotation.z = time * 0.0007 * speedMult;

    ring1.rotation.z = time * 0.0004 * speedMult;
    ring2.rotation.x = time * 0.0005 * speedMult;
    ring3.rotation.y = -time * 0.0003 * speedMult;

    nodes.forEach((n, idx) => {
      const curAngle = n.baseAngle + time * 0.0005 * (idx % 2 === 0 ? 1 : -1);
      n.mesh.position.x = Math.cos(curAngle) * n.rad;
      n.mesh.position.y = Math.sin(curAngle) * n.rad * 0.6;
    });

    clusterLight.intensity = (2.8 + Math.sin(time * 0.0025) * 0.6) + proximity * 3.5;
  }

  return {
    cluster,
    updateResearchCluster
  };
}
