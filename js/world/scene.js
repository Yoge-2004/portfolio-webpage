/**
 * THREE.Scene & Atmospheric Fog Initialization
 */
import * as THREE from 'three';
import { COLORS } from '../core/config.js';

export function createScene() {
  const scene = new THREE.Scene();
  const voidColor = new THREE.Color(COLORS.void);
  scene.background = voidColor;
  scene.fog = new THREE.Fog(COLORS.void, 22, 135);

  return scene;
}
