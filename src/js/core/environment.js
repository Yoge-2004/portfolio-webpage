/**
 * ENVIRONMENT
 * -----------
 * Owns the scene's lighting rig, fog and colour state. The palette is lerped
 * between chapter states so lighting, fog colour and accents shift as the
 * visitor travels instead of sitting in one static look.
 *
 * Performance: all colours are held as pre-parsed THREE.Color objects and
 * lerped natively (no per-frame string parsing or allocation). When the
 * blend has settled onto the target we stop touching the lights entirely, so
 * a static chapter costs nothing.
 */

import * as THREE from "three";
import { paletteFor, themeOf } from "./palettes.js";
import { clamp, lerp } from "../utils.js";

/** Shared colours for material retoning (avoids per-call allocation). */
const WHITE_COLOR = new THREE.Color("#ffffff");
const BLACK_COLOR = new THREE.Color("#000000");

/** Approximate perceptual luminance of a THREE.Color (linear working space). */
function lum(c) {
  if (!c) return 0;
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

/** Pre-parses a palette's colour strings into THREE.Color instances once. */
function toColorState(p) {
  return {
    bg: new THREE.Color(p.bg),
    fog: new THREE.Color(p.fog),
    key: new THREE.Color(p.key),
    rim: new THREE.Color(p.rim),
    fill: new THREE.Color(p.fill),
    ambient: new THREE.Color(p.ambient),
    fogDensity: p.fogDensity,
    keyIntensity: p.keyIntensity,
    rimIntensity: p.rimIntensity,
    fillIntensity: p.fillIntensity,
    ambientIntensity: p.ambientIntensity,
  };
}

export class Environment {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.paletteId = "dusk";
    const initial = paletteFor(this.paletteId, themeOf());
    this.current = toColorState(initial);
    this.target = toColorState(initial);
    this.settled = true;

    this.group = new THREE.Group();
    scene.add(this.group);

    this.ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x223044, 0.45);
    this.key = new THREE.DirectionalLight(0xffffff, 1.2);
    this.key.position.set(6, 12, 8);
    this.rim = new THREE.DirectionalLight(0xffffff, 0.9);
    this.rim.position.set(-8, 4, -10);
    this.fill = new THREE.PointLight(0xffffff, 0.6, 90, 2);
    this.fill.position.set(0, 2, 0);

    this.group.add(this.ambient, this.hemi, this.key, this.rim, this.fill);

    this.fog = new THREE.FogExp2(this.current.fog.clone(), this.current.fogDensity);
    scene.fog = this.fog;

    this.renderer.setClearColor(this.current.bg, 1);
    this._applyToLights();
  }

  /** Set the palette this environment should blend toward (theme-aware). */
  setPalette(id) {
    const next = paletteFor(id, themeOf());
    if (!next) return;
    this.paletteId = id;
    this.target = toColorState(next);
    this.settled = false; // wake the blend
  }

  /**
   * Re-tone the whole scene for a light/dark switch — palette AND materials.
   *
   * Station geometry is built with dark-theme colours, so on a light theme
   * the meshes must be re-toned or every chapter shows dark smears on paper:
   *   · dark surfaces (lum < .5) pastelize toward white
   *   · bright accent materials (toneMapped:false, lum > .55) deepen so glows,
   *     particles and horizon bars still read on a light background
   * Switching back restores each material from a one-time snapshot, so the
   * dark theme is never altered. Materials are only recoloured (no shader
   * change), so this costs nothing on the GPU.
   */
  setTheme() {
    const light = themeOf() === "light";
    const white = WHITE_COLOR;
    const black = BLACK_COLOR;

    this.scene.traverse((obj) => {
      const mats = obj.material
        ? Array.isArray(obj.material) ? obj.material : [obj.material]
        : null;
      if (!mats) return;

      mats.forEach((m) => {
        if (!m.color) return;
        if (!m.userData._tone) {
          m.userData._tone = {
            color: m.color.clone(),
            emissive: m.emissive ? m.emissive.clone() : null,
            emissiveIntensity: m.emissiveIntensity,
          };
        }
        const base = m.userData._tone;
        const isAccent = m.toneMapped === false;

        if (light) {
          if (isAccent) {
            if (lum(m.color) > 0.55) {
              m.color.lerp(black, 0.45);
              if (m.emissive && lum(base.emissive) > 0.55) m.emissive.lerp(black, 0.45);
            }
          } else if (lum(m.color) < 0.5) {
            m.color.lerp(white, 0.74);
            if (m.emissive && m.emissive.getHex() !== 0) m.emissive.lerp(white, 0.6);
          }
        } else {
          m.color.copy(base.color);
          if (m.emissive && base.emissive) m.emissive.copy(base.emissive);
          m.emissiveIntensity = base.emissiveIntensity;
        }
      });
    });

    this.setPalette(this.paletteId);
  }

  /** Blend one step toward the target palette. Cheap and allocation-free. */
  update(delta) {
    if (this.settled) return; // nothing to do on a static chapter

    const t = clamp(delta * 2.2, 0, 1);
    const c = this.current;
    const g = this.target;

    c.bg.lerp(g.bg, t);
    c.fog.lerp(g.fog, t);
    c.key.lerp(g.key, t);
    c.rim.lerp(g.rim, t);
    c.fill.lerp(g.fill, t);
    c.ambient.lerp(g.ambient, t);
    c.fogDensity = lerp(c.fogDensity, g.fogDensity, t);
    c.keyIntensity = lerp(c.keyIntensity, g.keyIntensity, t);
    c.rimIntensity = lerp(c.rimIntensity, g.rimIntensity, t);
    c.fillIntensity = lerp(c.fillIntensity, g.fillIntensity, t);
    c.ambientIntensity = lerp(c.ambientIntensity, g.ambientIntensity, t);

    this._applyToLights();

    // Once we are visually on target, stop updating until the next setPalette.
    const onTarget =
      colorClose(c.bg, g.bg) &&
      colorClose(c.key, g.key) &&
      Math.abs(c.keyIntensity - g.keyIntensity) < 0.01 &&
      Math.abs(c.fogDensity - g.fogDensity) < 0.0005;
    if (onTarget) {
      // snap to exact target to avoid lingering tiny diffs
      c.bg.copy(g.bg);
      c.fog.copy(g.fog);
      c.key.copy(g.key);
      c.rim.copy(g.rim);
      c.fill.copy(g.fill);
      c.ambient.copy(g.ambient);
      c.fogDensity = g.fogDensity;
      c.keyIntensity = g.keyIntensity;
      c.rimIntensity = g.rimIntensity;
      c.fillIntensity = g.fillIntensity;
      c.ambientIntensity = g.ambientIntensity;
      this._applyToLights();
      this.settled = true;
    }
  }

  _applyToLights() {
    const c = this.current;
    this.ambient.color.copy(c.ambient);
    this.ambient.intensity = c.ambientIntensity;
    this.hemi.color.copy(c.key);
    this.hemi.groundColor.copy(c.fill);
    this.hemi.intensity = c.ambientIntensity * 0.7;
    this.key.color.copy(c.key);
    this.key.intensity = c.keyIntensity;
    this.rim.color.copy(c.rim);
    this.rim.intensity = c.rimIntensity;
    this.fill.color.copy(c.fill);
    this.fill.intensity = c.fillIntensity;
    this.fog.color.copy(c.fog);
    this.fog.density = c.fogDensity;
    this.renderer.setClearColor(c.bg, 1);
  }

  /** Move the key/fill lights to follow the camera so chapters stay lit. */
  followCamera(camera) {
    this.key.position.set(camera.position.x + 6, camera.position.y + 12, camera.position.z + 8);
    this.rim.position.set(camera.position.x - 8, camera.position.y + 4, camera.position.z - 10);
    this.fill.position.set(camera.position.x, camera.position.y + 2, camera.position.z + 2);
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.traverse((obj) => {
      if (obj.isLight) obj.dispose?.();
    });
  }
}

/** Whether two colours are within a small perceptual epsilon. */
function colorClose(a, b) {
  return (
    Math.abs(a.r - b.r) < 0.004 &&
    Math.abs(a.g - b.g) < 0.004 &&
    Math.abs(a.b - b.b) < 0.004
  );
}
