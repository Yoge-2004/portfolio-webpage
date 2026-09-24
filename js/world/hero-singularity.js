/**
 * Hero Archival Verification Singularity (Prologue 3D Centerpiece)
 * An interactive, tactile, morphing 3D sculpture at the entrance of the archive.
 */
import * as THREE from 'three';
import { COLORS } from '../core/config.js';
import { state } from '../core/state.js';

export function createHeroSingularity(scene) {
  const group = new THREE.Group();
  // Positioned in front of the camera in Prologue, offset slightly to frame the hero copy
  group.position.set(state.isMobile ? 0 : 1.8, 1.25, 0.5);

  // 1. Faceted Icosahedron Core with Specular Metallic Surface
  const coreGeo = new THREE.IcosahedronGeometry(1.35, 1);
  const coreMat = new THREE.MeshPhysicalMaterial({
    color: 0x1a1510,
    emissive: 0x24170c,
    roughness: 0.22,
    metalness: 0.88,
    clearcoat: 0.9,
    clearcoatRoughness: 0.15,
    reflectivity: 0.95
  });
  const coreMesh = new THREE.Mesh(coreGeo, coreMat);
  group.add(coreMesh);

  // 2. Luminous Wireframe Outer Cage
  const wireGeo = new THREE.WireframeGeometry(coreGeo);
  const wireMat = new THREE.LineBasicMaterial({
    color: COLORS.brass,
    transparent: true,
    opacity: 0.75,
    linewidth: 1.5
  });
  const wireLines = new THREE.LineSegments(wireGeo, wireMat);
  wireLines.scale.set(1.02, 1.02, 1.02);
  group.add(wireLines);

  // 3. Inner Radiant Nucleus (Pulsing Light Source)
  const innerGeo = new THREE.OctahedronGeometry(0.55, 0);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.4,
    roughness: 0.1,
    metalness: 0.9
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  group.add(innerMesh);

  // 4. Point Light emanating from the center of the singularity
  const coreLight = new THREE.PointLight(COLORS.lightBrass, 3.8, 18, 2);
  group.add(coreLight);

  // 5. Dual Counter-Rotating Gyroscope Rings
  const ringMat1 = new THREE.MeshBasicMaterial({
    color: COLORS.brass,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.65
  });
  const ring1 = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.14, 64), ringMat1);
  ring1.rotation.x = Math.PI / 3.2;
  group.add(ring1);

  const ringMat2 = new THREE.MeshBasicMaterial({
    color: 0x22d3ee, // Electric Cyan
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.55
  });
  const ring2 = new THREE.Mesh(new THREE.RingGeometry(2.5, 2.53, 64), ringMat2);
  ring2.rotation.y = Math.PI / 4.2;
  group.add(ring2);

  // 6. Floating Semantic Verification Pips (Orbiting Satellites)
  const satellites = [];
  const satGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
  const satMat1 = new THREE.MeshBasicMaterial({ color: COLORS.lightBrass });
  const satMat2 = new THREE.MeshBasicMaterial({ color: 0x22d3ee });

  for (let i = 0; i < 8; i++) {
    const mesh = new THREE.Mesh(satGeo, i % 2 === 0 ? satMat1 : satMat2);
    const angle = (i / 8) * Math.PI * 2;
    const rad = 2.85 + (i % 3) * 0.35;
    mesh.position.set(Math.cos(angle) * rad, Math.sin(angle) * rad * 0.7, Math.sin(angle * 2) * 0.5);
    group.add(mesh);
    satellites.push({ mesh, baseAngle: angle, rad, speed: 0.0004 + (i % 3) * 0.0002 });
  }

  scene.add(group);

  // Tactile Drag-to-Spin & Kinetic Friction Mechanics
  let isDragging = false;
  let prevPointerX = 0;
  let prevPointerY = 0;
  let spinVelX = 0;
  let spinVelY = 0;
  let dragRotX = 0;
  let dragRotY = 0;
  let pulseEnergy = 0;

  function onPointerDown(e) {
    // Only capture primary clicks in the hero chapter
    if (state.scrollProgress > 0.08) return;
    // Don't hijack clicks on buttons/links
    if (e.target.closest('a, button, input')) return;
    isDragging = true;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - prevPointerX;
    const dy = e.clientY - prevPointerY;
    prevPointerX = e.clientX;
    prevPointerY = e.clientY;

    spinVelY += dx * 0.0045;
    spinVelX += dy * 0.0045;
    pulseEnergy = Math.min(pulseEnergy + 0.15, 1.5);
  }

  function onPointerUp() {
    isDragging = false;
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });
  }

  function updateHeroSingularity(time, camZ = 4, smoothPtr = { x: 0, y: 0 }) {
    // Distance from hero position (camZ starts at 4 and goes down to -160)
    const distFromHero = Math.abs(camZ - 4.0);
    // Smoothly scale down and fade as the visitor scrolls away from Prologue
    const visibility = THREE.MathUtils.clamp(1 - distFromHero / 18, 0, 1);
    group.visible = visibility > 0.01;

    if (!group.visible) return;

    // Apply spin inertia and damping
    dragRotY += spinVelY;
    dragRotX += spinVelX;
    spinVelY *= 0.93;
    spinVelX *= 0.93;
    pulseEnergy *= 0.95;

    // Interactive mouse parallax tilt + user drag rotation
    const targetRotX = (smoothPtr.y || 0) * 0.45 + dragRotX;
    const targetRotY = (smoothPtr.x || 0) * 0.55 + dragRotY;
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotX, 0.08);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, targetRotY, 0.08);

    // Continuous kinetic choreography
    coreMesh.rotation.y = time * 0.0005 + dragRotY * 0.5;
    coreMesh.rotation.x = Math.sin(time * 0.0003) * 0.2 + dragRotX * 0.5;
    wireLines.rotation.y = coreMesh.rotation.y;
    wireLines.rotation.x = coreMesh.rotation.x;

    innerMesh.rotation.y = -time * 0.0008;
    innerMesh.rotation.z = time * 0.0006;
    const pulse = 1.0 + Math.sin(time * 0.003) * 0.14 + pulseEnergy * 0.4;
    innerMesh.scale.set(pulse, pulse, pulse);

    ring1.rotation.z = time * 0.00035 + spinVelY * 2;
    ring2.rotation.z = -time * 0.00028 - spinVelX * 2;

    satellites.forEach(s => {
      const curAngle = s.baseAngle + time * s.speed;
      s.mesh.position.x = Math.cos(curAngle) * s.rad;
      s.mesh.position.y = Math.sin(curAngle) * s.rad * 0.7;
      s.mesh.position.z = Math.sin(curAngle * 2) * 0.5;
      s.mesh.rotation.x += 0.01;
      s.mesh.rotation.y += 0.015;
    });

    coreLight.intensity = (3.4 + Math.sin(time * 0.003) * 0.8 + pulseEnergy * 3.0) * visibility;
    group.scale.setScalar(visibility);
  }

  return {
    group,
    updateHeroSingularity
  };
}
