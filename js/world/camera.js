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

  // Magnetic focal deceleration pockets at key architectural milestones
  const FOCAL_ANCHORS = [0.18, 0.27, 0.36, 0.45, 0.55, 0.64, 0.73, 0.82, 0.92];
  function shapeProgress(p) {
    if (state.reducedMotion) return p;
    let offset = 0;
    for (const a of FOCAL_ANCHORS) {
      const d = p - a;
      if (Math.abs(d) < 0.038) {
        const factor = Math.sin((d / 0.038) * (Math.PI / 2));
        offset -= factor * 0.0075;
      }
    }
    return THREE.MathUtils.clamp(p + offset, 0, 1);
  }

  function updateCamera(scrollProgress, smoothX, smoothY, exhibitionBays) {
    const shapedT = shapeProgress(scrollProgress);
    const pt = getPathPoint(shapedT);
    camPos.copy(pt);
    nextTarget.copy(getPathPoint(Math.min(1, shapedT + 0.035)));

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

    // 1. Intentional Look-At and Framing choreography near Exhibition Slabs (approach -> focus -> departure)
    if (exhibitionBays) {
      exhibitionBays.forEach(bay => {
        const dist = Math.abs(camera.position.z - bay.z);
        if (dist < 11) {
          // Smooth bell curve for focus engagement
          const focusWeight = Math.pow(THREE.MathUtils.clamp(1 - dist / 11, 0, 1), 2);
          
          // Lateral framing: dolly slightly away from the exhibit side to frame it cleanly in the spatial viewport
          const lateralDolly = (bay.side * -0.55) * focusWeight;
          camera.position.x += lateralDolly;

          // Focal Look-At tracking
          camTarget.x += (bay.baseX - camTarget.x) * focusWeight * 0.65;
          camTarget.y += (bay.baseY - camTarget.y) * focusWeight * 0.45;
          camTarget.z += (bay.z - camTarget.z) * focusWeight * 0.35;
        }
      });
    }

    // 2. Research Chamber (Neuro-Symbolic Cluster at z: -42, x: -2.8)
    const researchDist = Math.abs(camera.position.z - -42);
    if (researchDist < 12) {
      const rWeight = Math.pow(THREE.MathUtils.clamp(1 - researchDist / 12, 0, 1), 2);
      // Dolly camera rightwards to frame the rotating 3D cluster in the left spatial viewport
      camera.position.x += 0.75 * rWeight;
      camTarget.x += (-2.8 - camTarget.x) * rWeight * 0.55;
      camTarget.y += (1.4 - camTarget.y) * rWeight * 0.35;
      camTarget.z += (-42 - camTarget.z) * rWeight * 0.25;
    }

    // 3. Arena Proving Grounds (Overhead Trusses at z: -98 to -110)
    if (camera.position.z <= -94 && camera.position.z >= -112) {
      const arenaT = 1 - Math.abs(camera.position.z - -103) / 9;
      const arenaWeight = THREE.MathUtils.clamp(arenaT, 0, 1);
      // Dip camera slightly lower for imposing structural scale
      camera.position.y += (-0.28) * arenaWeight;
      camTarget.y += 0.45 * arenaWeight;
    }

    // 4. Journey / Milestones (Spatial Guide Rail at z: -125 to -143)
    if (camera.position.z <= -124 && camera.position.z >= -144) {
      const railT = 1 - Math.abs(camera.position.z - -134) / 10;
      const railWeight = THREE.MathUtils.clamp(railT, 0, 1);
      // Subtly bias look-at toward the milestone markers on the right
      camTarget.x += 0.85 * railWeight;
    }

    // 5. Culmination / Horizon Portal (z: -145 to -160)
    if (camera.position.z <= -144) {
      const horizonWeight = THREE.MathUtils.clamp(( -144 - camera.position.z ) / 16, 0, 1);
      // Center camera firmly on the portal axis and gaze toward infinity
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, horizonWeight * 0.85);
      camTarget.x = THREE.MathUtils.lerp(camTarget.x, 0, horizonWeight * 0.85);
      camTarget.y = THREE.MathUtils.lerp(camTarget.y, 1.5, horizonWeight * 0.85);
      camTarget.z = THREE.MathUtils.lerp(camTarget.z, -170, horizonWeight * 0.85);
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
