/**
 * Physical Exhibition Slabs: Mesh Construction, Textures, and Proximity Activation
 */
import * as THREE from 'three';
import { COLORS, EXHIBIT_CONFIGS } from '../core/config.js';

export function createExhibits(scene, getPathPoint, progressOfZ) {
  const exhibitionBays = [];

  EXHIBIT_CONFIGS.forEach(cfg => {
    const pt = getPathPoint(progressOfZ(cfg.z));
    const srcCanvas = document.querySelector(`canvas[data-shot="${cfg.shotIdx}"]`);
    const canvasTex = srcCanvas ? new THREE.CanvasTexture(srcCanvas) : null;

    if (canvasTex) {
      canvasTex.colorSpace = THREE.SRGBColorSpace;
      canvasTex.anisotropy = 4;
    }

    // Heavy Plinth Slab
    const slabGroup = new THREE.Group();
    const slabGeo = new THREE.BoxGeometry(4.8, 3.0, 0.18);
    const slabMaterials = [
      new THREE.MeshStandardMaterial({ color: COLORS.graphite, roughness: 0.85 }), // right
      new THREE.MeshStandardMaterial({ color: COLORS.graphite, roughness: 0.85 }), // left
      new THREE.MeshStandardMaterial({ color: COLORS.graphite, roughness: 0.85 }), // top
      new THREE.MeshStandardMaterial({ color: COLORS.graphite, roughness: 0.85 }), // bottom
      canvasTex
        ? new THREE.MeshBasicMaterial({ map: canvasTex })
        : new THREE.MeshStandardMaterial({ color: 0x16120e }),                      // front
      new THREE.MeshStandardMaterial({ color: 0x100c08, roughness: 0.9 })            // back
    ];
    const slabMesh = new THREE.Mesh(slabGeo, slabMaterials);
    slabGroup.add(slabMesh);

    // Architectural Perimeter Brass Hairline
    const borderGeo = new THREE.EdgesGeometry(slabGeo);
    const borderMat = new THREE.LineBasicMaterial({ color: COLORS.brass });
    const borderLines = new THREE.LineSegments(borderGeo, borderMat);
    slabGroup.add(borderLines);

    // Dedicated Local Spotlight
    const spot = new THREE.PointLight(COLORS.lightBrass, 2.2, 14, 2);
    spot.position.set(0, 1.8, 2.4);
    slabGroup.add(spot);

    // Staging position in alcove
    const baseX = pt.x + cfg.side * 4.4;
    const baseY = pt.y + 0.8;
    const baseRotY = cfg.side > 0 ? -Math.PI / 2.6 : Math.PI / 2.6;

    slabGroup.position.set(baseX, baseY, cfg.z);
    slabGroup.rotation.y = baseRotY;

    scene.add(slabGroup);

    exhibitionBays.push({
      group: slabGroup,
      light: spot,
      tex: canvasTex,
      baseX,
      baseY,
      baseRotY,
      z: cfg.z,
      side: cfg.side
    });
  });

  function updateExhibits(camZ) {
    exhibitionBays.forEach(bay => {
      const dist = Math.abs(camZ - bay.z);
      const near = THREE.MathUtils.clamp(1 - dist / 8.0, 0, 1);
      const face = near * near * (3 - 2 * near); // smoothstep

      // Steps forward out of alcove and rotates to face camera
      bay.group.position.x = THREE.MathUtils.lerp(bay.baseX, bay.baseX - bay.side * 0.85, face);
      bay.group.rotation.y = THREE.MathUtils.lerp(bay.baseRotY, 0, face * 0.92);
      bay.light.intensity = 1.4 + face * 4.8;
    });
  }

  function refreshExhibitTextures() {
    exhibitionBays.forEach(b => {
      if (b.tex) b.tex.needsUpdate = true;
    });
  }

  return {
    exhibitionBays,
    updateExhibits,
    refreshExhibitTextures
  };
}
