/**
 * Chapter Transition & Environmental Lighting Orchestration
 */
import * as THREE from 'three';
import { COLORS } from '../core/config.js';

export const CHAPTER_ATMOSPHERES = {
  PROLOGUE: {
    fogNear: 12,
    fogFar: 68,
    spotColor: COLORS.lightBrass,
    spotIntensity: 7.2,
    ambientColor: 0xfff5ea,
    ambientIntensity: 0.35,
    accentColor: COLORS.brass
  },
  ORIGIN: {
    fogNear: 10,
    fogFar: 62,
    spotColor: COLORS.brass,
    spotIntensity: 6.8,
    ambientColor: 0xf5ede2,
    ambientIntensity: 0.32,
    accentColor: COLORS.brass
  },
  DISCOVERY: {
    fogNear: 8,
    fogFar: 54,
    spotColor: COLORS.copper,
    spotIntensity: 6.5,
    ambientColor: 0x4a2a1a,
    ambientIntensity: 0.45,
    accentColor: COLORS.copper
  },
  QUESTS: {
    fogNear: 10,
    fogFar: 60,
    spotColor: COLORS.lightBrass,
    spotIntensity: 7.5,
    ambientColor: 0x211c16,
    ambientIntensity: 0.38,
    accentColor: COLORS.brass
  },
  'EXHIBIT 01': {
    fogNear: 9,
    fogFar: 56,
    spotColor: COLORS.copper,
    spotIntensity: 7.8,
    ambientColor: 0x2a1c12,
    ambientIntensity: 0.4,
    accentColor: COLORS.copper
  },
  'EXHIBIT 02': {
    fogNear: 9,
    fogFar: 56,
    spotColor: COLORS.brass,
    spotIntensity: 7.8,
    ambientColor: 0x211c16,
    ambientIntensity: 0.38,
    accentColor: COLORS.brass
  },
  'EXHIBIT 03': {
    fogNear: 9,
    fogFar: 56,
    spotColor: COLORS.lightBrass,
    spotIntensity: 7.8,
    ambientColor: 0x211c16,
    ambientIntensity: 0.38,
    accentColor: COLORS.brass
  },
  ARENA: {
    fogNear: 7,
    fogFar: 50,
    spotColor: COLORS.ember,
    spotIntensity: 8.2,
    ambientColor: 0x3d1a0e,
    ambientIntensity: 0.48,
    accentColor: COLORS.ember
  },
  CAPABILITY: {
    fogNear: 10,
    fogFar: 64,
    spotColor: COLORS.brass,
    spotIntensity: 7.0,
    ambientColor: 0x211c16,
    ambientIntensity: 0.35,
    accentColor: COLORS.brass
  },
  PATH: {
    fogNear: 11,
    fogFar: 66,
    spotColor: COLORS.brass,
    spotIntensity: 6.8,
    ambientColor: 0x1a1510,
    ambientIntensity: 0.32,
    accentColor: COLORS.brass
  },
  CONTACT: {
    fogNear: 14,
    fogFar: 85,
    spotColor: COLORS.lightBrass,
    spotIntensity: 8.8,
    ambientColor: 0x33281c,
    ambientIntensity: 0.52,
    accentColor: COLORS.lightBrass
  }
};

export function createTransitionController(scene, lights) {
  let currentChapter = 'PROLOGUE';
  const targetSpotCol = new THREE.Color(COLORS.lightBrass);
  const targetAmbCol = new THREE.Color(0xfff5ea);

  function applyChapterPreset(chapterName) {
    if (currentChapter === chapterName) return;
    currentChapter = chapterName;

    const preset = CHAPTER_ATMOSPHERES[chapterName] || CHAPTER_ATMOSPHERES.PROLOGUE;

    targetSpotCol.set(preset.spotColor);
    targetAmbCol.set(preset.ambientColor);

    if (scene.fog) {
      scene.fog.near = preset.fogNear;
      scene.fog.far = preset.fogFar;
    }
  }

  function updateTransitions(easing = 0.08) {
    if (lights?.cameraSpot) {
      lights.cameraSpot.color.lerp(targetSpotCol, easing);
    }
    if (lights?.ambient) {
      lights.ambient.color.lerp(targetAmbCol, easing);
    }
  }

  return {
    applyChapterPreset,
    updateTransitions
  };
}
