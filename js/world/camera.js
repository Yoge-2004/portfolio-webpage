/**
 * Camera Choreography, Spline Travel, and Focal Look-At System
 */
import * as THREE from 'three';
import { WAYPOINTS } from '../core/config.js';
import { state } from '../core/state.js';

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(44, innerWidth / innerHeight, 0.1, 140);

  const cameraPath = new THREE.CatmullRomCurve3(
    WAYPOINTS.map(p => new THREE.Vector3(...p)),
    false,
    'catmullrom',
    0.35
  );

  const _tempPos = new THREE.Vector3();
  const getPathPoint = t => {
    cameraPath.getPointAt(THREE.MathUtils.clamp(t, 0, 1), _tempPos);
    return _tempPos;
  };

  function progressOfZ(z) {
    for (let i = 0; i < WAYPOINTS.length - 1; i++) {
      const a = WAYPOINTS[i];
      const b = WAYPOINTS[i + 1];
      if (z <= a[2] && z >= b[2]) {
        return (i + (a[2] - z) / (a[2] - b[2])) / (WAYPOINTS.length - 1);
      }
    }
    return z > WAYPOINTS[0][2] ? 0 : 1;
  }

  const camPos = new THREE.Vector3();
  const camTarget = new THREE.Vector3();
  const nextTarget = new THREE.Vector3();
  const fwd = new THREE.Vector3();
  const rgt = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);

  function updateCamera(scrollProgress, smoothX, smoothY, exhibitionBays) {
    const pt = getPathPoint(scrollProgress);
    camPos.copy(pt);
    nextTarget.copy(getPathPoint(Math.min(1, scrollProgress + 0.035)));

    fwd.subVectors(nextTarget, camPos).normalize();
    rgt.crossVectors(fwd, up).normalize();

    // Secondary subtle parallax offset
    const pxOff = smoothX * (state.isMobile ? 0.12 : 0.28);
    const pyOff = -smoothY * (state.isMobile ? 0.08 : 0.16);

    camera.position.set(
      camPos.x + rgt.x * pxOff,
      camPos.y + pyOff,
      camPos.z + rgt.z * pxOff
    );

    camTarget.set(
      nextTarget.x + rgt.x * pxOff * 0.5,
      nextTarget.y + pyOff * 0.5,
      nextTarget.z + rgt.z * pxOff * 0.5
    );

    // Intentional Look-At choreography near Exhibition Slabs
    if (exhibitionBays) {
      exhibitionBays.forEach(bay => {
        const dist = Math.abs(camera.position.z - bay.z);
        const glance = THREE.MathUtils.clamp(1 - dist / 9.5, 0, 1);
        if (glance > 0) {
          camTarget.x += (bay.baseX - camTarget.x) * glance * 0.42;
          camTarget.y += (bay.baseY - camTarget.y) * glance * 0.25;
        }
      });
    }

    // Intentional Look-At near Research Cluster (z: -42)
    const researchDist = Math.abs(camera.position.z - -42);
    const rGlance = THREE.MathUtils.clamp(1 - researchDist / 10, 0, 1);
    if (rGlance > 0) {
      camTarget.x += (-2.8 - camTarget.x) * rGlance * 0.35;
      camTarget.y += (1.4 - camTarget.y) * rGlance * 0.2;
    }

    camera.lookAt(camTarget);
    return camera.position;
  }

  return {
    camera,
    getPathPoint,
    progressOfZ,
    updateCamera
  };
}
