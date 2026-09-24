/**
 * THREE.Scene & Atmospheric Fog Initialization
 * Deep obsidian canvas with cinematic atmospheric depth.
 */
import * as THREE from 'three';

export function createScene() {
  const scene = new THREE.Scene();
  const voidColor = new THREE.Color(0x06080d);
  scene.background = voidColor;

  // Atmospheric fog with generous depth so distant architectural beacons are visible
  scene.fog = new THREE.Fog(0x06080d, 28, 175);

  return scene;
}
