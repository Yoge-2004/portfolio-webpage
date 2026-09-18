/**
 * Post-Processing Pipeline (Desktop only)
 */
import * as THREE from 'three';
import { EffectComposer } from '../../vendor/three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../../vendor/three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../../vendor/three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../../vendor/three/examples/jsm/postprocessing/OutputPass.js';
import { state } from '../core/state.js';

export function createPostProcessing(renderer, scene, camera) {
  if (state.isMobile) return null;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight),
    0.35, // strength
    0.45, // radius
    0.88  // threshold
  );
  composer.addPass(bloomPass);
  composer.addPass(new OutputPass());

  return composer;
}
