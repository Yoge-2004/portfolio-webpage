/**
 * ENGINE
 * ------
 * Owns the WebGL renderer, the camera, the render loop and the
 * camera rig that the scroll choreography drives. Falls back
 * gracefully when WebGL is unavailable.
 */

import * as THREE from "three";
import { Environment } from "./environment.js";
import { clamp, deviceTier, isWebGLAvailable, prefersReducedMotion } from "../utils.js";

const TIER_SETTINGS = {
  // Pixel ratio capped conservatively: beyond ~1.5 the extra pixels rarely
  // read on these dark scenes but cost a lot of fill rate. Antialias is left
  // to the (cheaper) high tier only.
  high: { pixelRatio: 1.5, antialias: true, shadows: false, particles: 0.85 },
  mid: { pixelRatio: 1.3, antialias: false, shadows: false, particles: 0.55 },
  low: { pixelRatio: 1.1, antialias: false, shadows: false, particles: 0.3 },
};

/**
 * Distance between chapter stations along the world path. Every station is
 * placed at exactly this interval so the camera path, the station anchors
 * and the scroll mapping can never disagree.
 */
export const STATION_SPACING = 150;

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.tier = deviceTier();
    this.settings = TIER_SETTINGS[this.tier] ?? TIER_SETTINGS.mid;
    this.reducedMotion = prefersReducedMotion();
    this.stations = [];
    this.clock = new THREE.Clock();
    this.travel = 0;
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    this.running = false;
    this.frame = 0;
    this.visible = true;
    /** Called once per rendered frame, before the scene is drawn. */
    this.onFrame = null;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(52, 1, 0.1, 600);
    this.camera.position.set(0, 2, 60);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: this.settings.antialias,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.settings.pixelRatio));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.06;

    this.environment = new Environment(this.scene, this.renderer);
    this.stationRoot = new THREE.Group();
    this.scene.add(this.stationRoot);

    this._lookTarget = new THREE.Vector3();
    this._tempVec = new THREE.Vector3();
  }

  /** Registers a chapter station. Stations are placed along a gentle path. */
  addStation(station, index) {
    station.group.position.set(
      Math.sin(index * 0.9) * 26,
      Math.sin(index * 0.55) * 5,
      -index * STATION_SPACING,
    );
    station.baseZ = -index * STATION_SPACING;
    this.stations.push(station);
    this.stationRoot.add(station.group);
    return station;
  }

  /** Static world position for a station index — used by the camera rig. */
  stationPoint(index, target = new THREE.Vector3()) {
    return target.set(
      Math.sin(index * 0.9) * 26,
      Math.sin(index * 0.55) * 5 + 2,
      -index * STATION_SPACING,
    );
  }

  setPointer(nx, ny) {
    this.pointer.tx = nx;
    this.pointer.ty = ny;
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    // Narrow viewports need a wider FOV so compositions never clip.
    this.camera.fov = w < 640 ? 66 : w < 1024 ? 60 : 52;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
    this.stations.forEach((s) => s.resize?.(w, h));
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();

    // Adaptive quality: if we sustain slow frames, step the pixel ratio down
    // once so the experience stays smooth on weaker GPUs. Never steps back up
    // (avoids oscillation), and never below a legible floor.
    this._slowFrames = 0;
    this._currentDpr = Math.min(window.devicePixelRatio || 1, this.settings.pixelRatio);
    this._dprFloor = 0.9;

    const loop = () => {
      if (!this.running) return;
      this.frame = requestAnimationFrame(loop);
      if (!this.visible) return;
      this.update();
    };
    this.frame = requestAnimationFrame(loop);
  }

  _monitorPerformance(delta) {
    // delta > ~40ms ⇒ under 25fps. Count a run of slow frames before acting.
    if (delta > 0.04) this._slowFrames++;
    else this._slowFrames = Math.max(0, this._slowFrames - 1);

    if (this._slowFrames > 40 && this._currentDpr > this._dprFloor) {
      this._currentDpr = Math.max(this._dprFloor, this._currentDpr - 0.25);
      this.renderer.setPixelRatio(this._currentDpr);
      this._slowFrames = 0;
      if (this._currentDpr <= this._dprFloor) {
        document.documentElement.classList.add("perf-lite");
      }
    }
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  update() {
    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.05);
    const time = this.clock.elapsedTime;

    this._monitorPerformance(rawDelta);

    // Smooth the pointer so parallax never snaps.
    this.pointer.x += (this.pointer.tx - this.pointer.x) * Math.min(delta * 3.2, 1);
    this.pointer.y += (this.pointer.ty - this.pointer.y) * Math.min(delta * 3.2, 1);

    // The choreography owns camera + station updates for this frame.
    this.onFrame?.(delta, time);

    this.environment.update(delta);
    this.environment.followCamera(this.camera);

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          for (const key of Object.keys(m)) {
            const value = m[key];
            if (value && value.isTexture) value.dispose();
          }
          m.dispose();
        });
      }
    });
    this.renderer.dispose();
  }
}

/** Creates an engine, or returns null when WebGL is unavailable. */
export function createEngine(canvas) {
  if (!isWebGLAvailable()) return null;
  try {
    return new Engine(canvas);
  } catch (error) {
    console.warn("[engine] WebGL initialisation failed, falling back to static atmosphere.", error);
    return null;
  }
}

export { clamp };
