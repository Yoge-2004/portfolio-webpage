/**
 * 3D Spatial World Coordinator
 */
import { state } from '../core/state.js';
import { createRenderer } from './renderer.js';
import { createScene } from './scene.js';
import { createCamera } from './camera.js';
import { createEnvironment } from './environment.js';
import { createLighting } from './lighting.js';
import { createExhibits } from './exhibits.js';
import { createResearchCluster } from './research-cluster.js';
import { createArenaTrusses } from './arena-trusses.js';
import { createMilestones } from './milestones.js';
import { createHorizonPortal } from './horizon-portal.js';
import { createParticles } from './particles.js';
import { createPostProcessing } from './postprocessing.js';
import { createTransitionController } from '../animation/transitions.js';
import { subscribeState } from '../core/state.js';
import { setupFallback } from '../accessibility/fallback.js';

export function initWorld(pointerController, telemetryController, revealController) {
  const canvas = document.getElementById('world');
  if (!canvas) return null;

  try {
    const { renderer, handleResize } = createRenderer(canvas);
    const scene = createScene();
    const { camera, getPathPoint, progressOfZ, updateCamera } = createCamera();

    // Fallback handler
    const { fallbackToStatic } = setupFallback(canvas, renderer);

    // Architectural World Props
    createEnvironment(scene, getPathPoint, progressOfZ);
    const lights = createLighting(scene);
    const { updateLighting } = lights;
    const transitionCtrl = createTransitionController(scene, { cameraSpot: lights.cameraSpot, ambient: lights.ambient });
    subscribeState((prop, val) => {
      if (prop === 'chapter') {
        transitionCtrl.applyChapterPreset(val.chapter);
      }
    });
    const { exhibitionBays, updateExhibits, refreshExhibitTextures } = createExhibits(scene, getPathPoint, progressOfZ);
    const { updateResearchCluster } = createResearchCluster(scene);
    createArenaTrusses(scene, getPathPoint, progressOfZ);
    const { updateMilestones } = createMilestones(scene, getPathPoint, progressOfZ);
    const { updateHorizonPortal } = createHorizonPortal(scene);
    const { updateParticles } = createParticles(scene);

    // Post-Processing
    const composer = createPostProcessing(renderer, scene, camera);

    // Animation Step
    function tick(time) {
      // Smooth scroll interpolation
      state.scrollProgress += (state.targetProgress - state.scrollProgress) * (state.reducedMotion ? 1 : 0.08);

      // Smooth pointer parallax
      const smoothPtr = pointerController.updateSmoothPointer();

      // Camera choreography
      const camPos = updateCamera(state.scrollProgress, smoothPtr.x, smoothPtr.y, exhibitionBays);
      updateLighting(camPos, smoothPtr);
      transitionCtrl.updateTransitions();

      // Props animation
      updateResearchCluster(time, camPos.z);
      updateExhibits(camPos.z);
      updateMilestones(camPos.z);
      updateHorizonPortal(time, camPos.z);
      updateParticles(time);

      // Render
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      // UI updates
      if (telemetryController) {
        telemetryController.updateHUD();
        telemetryController.checkActiveChapter();
      }
      if (revealController) {
        revealController.trackTimelineFocus();
      }
    }

    if (state.reducedMotion) {
      updateCamera(0, 0, 0, exhibitionBays);
      renderer.render(scene, camera);
    } else {
      renderer.setAnimationLoop(tick);
    }

    addEventListener('resize', () => {
      handleResize(camera, composer);
      if (state.reducedMotion) renderer.render(scene, camera);
    }, { passive: true });

    return {
      renderer,
      scene,
      camera,
      refreshExhibitTextures,
      fallbackToStatic
    };
  } catch (err) {
    console.error('Failed to initialize 3D world:', err);
    return null;
  }
}
