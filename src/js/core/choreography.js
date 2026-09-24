/**
 * CHOREOGRAPHY
 * ------------
 * The master scroll timeline. Scroll progress drives:
 *   · the camera travelling along the world path
 *   · each station's local progress
 *   · the environment palette
 *   · the active chapter (and therefore DOM colour + navigation)
 *   · headline depth (typography existing in 3D space)
 *
 * Segment durations are proportional to each chapter's real height so a
 * tall chapter gets more camera time, and the mapping is rebuilt on resize.
 */

import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHAPTERS } from "../config/chapters.js";
import { STATION_BUILDERS } from "../scenes/stations.js";
import { paletteFor, themeOf } from "./palettes.js";
import { STATION_SPACING } from "./engine.js";
import { clamp, lerp } from "../utils.js";

gsap.registerPlugin(ScrollTrigger);

export class Choreography {
  constructor({ engine, contentRoot, onChapterChange }) {
    this.engine = engine;
    this.contentRoot = contentRoot;
    this.onChapterChange = onChapterChange;
    this.chapters = [];
    this.travel = 0;
    this.travelTarget = 0;
    this.masterTimeline = null;
    this.chapterTriggers = [];
    this.headlines = [];
    this.activeIndex = 0;
    this.reducedMotion = engine.reducedMotion;

    this._camPos = new THREE.Vector3();
    this._lookAt = new THREE.Vector3();
    this._from = new THREE.Vector3();
    this._to = new THREE.Vector3();
  }

  /** Builds every station and every scroll trigger. */
  build() {
    const { engine } = this;

    // 1. Create the stations in chapter order. Each station is built with its
    //    own chapter's accent, so a station's colour always matches the
    //    chapter it belongs to.
    this.chapters = CHAPTERS.map((chapter, index) => {
      const builder = STATION_BUILDERS[chapter.scene];
      const station = builder({
        accent: paletteFor(chapter.palette, themeOf()).accent,
        tier: engine.settings,
      });
      engine.addStation(station, index);
      const element = document.getElementById(`chapter-${chapter.id}`);
      return { chapter, station, element, index, progress: 0 };
    });

    // 2. Measure and create triggers.
    this.measure();
    this.createChapterTriggers();
    this.createMasterTimeline();
  }

  /** Reads chapter geometry from the DOM. */
  measure() {
    this.docHeight = this.contentRoot.scrollHeight;
    this.chapters.forEach((entry) => {
      if (!entry.element) return;
      const rect = entry.element.getBoundingClientRect();
      entry.top = rect.top + window.scrollY;
      entry.height = rect.height;
    });
    // Total travel = distance between the first and last station anchors.
    const last = this.chapters[this.chapters.length - 1];
    this.totalTravel = Math.abs(engineStationZ(last.station) - engineStationZ(this.chapters[0].station));
  }

  /** One ScrollTrigger per chapter: drives station progress + active state. */
  createChapterTriggers() {
    this.chapterTriggers.forEach((t) => t.kill());
    this.chapterTriggers = [];

    this.chapters.forEach((entry) => {
      if (!entry.element) return;

      // Station-local progress: a chapter animates continuously while it is
      // anywhere near the viewport. The per-frame loop reads this value.
      const progressTrigger = ScrollTrigger.create({
        trigger: entry.element,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          entry.progress = self.progress;
        },
      });

      this.chapterTriggers.push(progressTrigger);
    });
  }

  /** The scrubbed master timeline that moves the camera through the world. */
  createMasterTimeline() {
    if (this.masterTimeline) this.masterTimeline.kill();

    const state = { travel: 0 };

    if (this.reducedMotion) {
      // No camera travel — park the camera at the first station.
      this.travel = 0;
      this.travelTarget = 0;
      this.positionCamera(0, 0);
      this.stations.forEach((entry) => {
        entry.station.update?.(0, 0, entry.progress);
      });
      return;
    }

    this.masterTimeline = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: this.contentRoot,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.85,
        onUpdate: (self) => {
          this.travelTarget = state.travel;
          this.syncActiveChapter(self.scroll());
          this.syncActiveWorld();
        },
      },
    });

    // One tween per chapter segment, duration proportional to chapter height
    // so a tall chapter gets proportionally more camera time.
    const totalHeight = this.chapters.reduce((sum, c) => sum + (c.height || 1), 0);
    this.chapters.forEach((entry, i) => {
      const to = engineStationZ(this.chapters[i + 1]?.station ?? entry.station);
      const weight = (entry.height || 1) / totalHeight;
      this.masterTimeline.to(state, {
        travel: to,
        duration: Math.max(0.35, weight * 10),
        ease: "sine.inOut",
      });
    });

    this.travelTarget = 0;
  }

  /**
   * Deterministic active chapter: whichever chapter's real scroll range
   * contains the current scroll position. Because this reads measured DOM
   * geometry and the same registry the navigation is built from, the HUD can
   * never disagree with the section on screen.
   */
  syncActiveChapter(scrollY) {
    let active = 0;
    for (let i = 0; i < this.chapters.length; i++) {
      const entry = this.chapters[i];
      if (!entry.element) continue;
      const rect = entry.element.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const bottom = top + rect.height;
      // A chapter becomes active once its top passes 55% of the viewport.
      if (scrollY + window.innerHeight * 0.55 >= top && scrollY + window.innerHeight * 0.55 < bottom) {
        active = i;
        break;
      }
      if (scrollY + window.innerHeight * 0.55 >= bottom) active = i;
    }
    this.setActiveChapter(active);
  }

  setActiveChapter(index) {
    if (index === this.activeIndex) return;
    this.activeIndex = index;
    const entry = this.chapters[index];
    if (!entry) return;

    this.engine.environment.setPalette(entry.chapter.palette);
    this.onChapterChange?.(entry.chapter, index);

    if (entry.chapter.id !== "worlds") {
      delete document.documentElement.dataset.activeWorld;
      this._activeWorld = "";
    }
  }

  /**
   * Inside chapter 08, each of the three project "worlds" carries its own
   * accent. This runs every scroll update (not just on chapter change) so the
   * DOM colour — and therefore the whole page's accent + tab colour — tracks
   * whichever world is currently centred on screen.
   */
  syncActiveWorld() {
    const worldsEntry = this.chapters.find((c) => c.chapter.id === "worlds");
    if (!worldsEntry?.element || this.activeIndex !== worldsEntry.index) return;

    const worlds = worldsEntry.element.querySelectorAll("[data-world]");
    if (!worlds.length) return;

    const mid = window.innerHeight * 0.5;
    let current = worlds[0];
    for (const w of worlds) {
      const rect = w.getBoundingClientRect();
      if (rect.top <= mid) current = w;
    }
    const id = current?.dataset.world ?? "";
    if (id !== this._activeWorld) {
      this._activeWorld = id;
      document.documentElement.dataset.activeWorld = id;
    }
  }

  /** Called every frame: eases the camera toward the scroll target. */
  update(delta, time) {
    const { engine } = this;

    if (this.reducedMotion) {
      // Only the two nearest stations animate; the rest are parked visible.
      this._updateVisibleStations(0, delta, time);
      this.positionCamera(0, time);
      return;
    }

    // Frame-rate independent easing toward the scrubbed target.
    const ease = 1 - Math.pow(0.0016, delta);
    this.travel = lerp(this.travel, this.travelTarget, clamp(ease, 0, 1));

    const raw = clamp(-this.travel / STATION_SPACING, 0, this.chapters.length - 1);
    this._updateVisibleStations(raw, delta, time);
    this.positionCamera(this.travel, time);
  }

  /**
   * Only the stations within a small window of the camera are updated and
   * rendered each frame. Distant stations are hidden entirely, so the GPU
   * never draws geometry the visitor cannot see — the main perf win.
   */
  _updateVisibleStations(raw, delta, time) {
    const near = Math.round(raw);
    for (let i = 0; i < this.chapters.length; i++) {
      const entry = this.chapters[i];
      const visible = Math.abs(i - near) <= 1; // current ± 1 station
      if (entry.station.group.visible !== visible) {
        entry.station.group.visible = visible;
      }
      if (visible) entry.station.update?.(delta, time, entry.progress);
    }
  }

  /** Places the camera along the world path, with pointer parallax. */
  positionCamera(travel, time) {
    const { engine } = this;
    const n = this.chapters.length;

    // `travel` runs from 0 down to -((n-1) * spacing) as the visitor scrolls,
    // so the station index is the negated, normalised distance.
    const raw = clamp(-travel / STATION_SPACING, 0, n - 1);
    const i = Math.min(Math.floor(raw), n - 2);
    const f = raw - i;

    this._from.copy(engine.stationPoint(i));
    this._to.copy(engine.stationPoint(i + 1));
    this._camPos.copy(this._from).lerp(this._to, f);

    // Camera height/offset: rise through the middle of the journey so the
    // arena and the constellation read from above, then settle at the end.
    const arc = Math.sin(clamp(raw / Math.max(1, n - 1)) * Math.PI);
    this._camPos.y += arc * 16 + 3;
    this._camPos.z += 46; // sit ahead of the station anchor, looking forward

    // Look ahead down the path.
    const ahead = clamp(raw + 0.45, 0, n - 1);
    const ai = Math.min(Math.floor(ahead), n - 2);
    const af = ahead - ai;
    this._from.copy(engine.stationPoint(ai));
    this._to.copy(engine.stationPoint(ai + 1));
    this._lookAt.copy(this._from).lerp(this._to, af);

    // Pointer parallax — subtle, never enough to break composition.
    const px = engine.pointer.x;
    const py = engine.pointer.y;
    this._camPos.x += px * 6;
    this._camPos.y += -py * 3.5;

    // A slow ambient drift so nothing is ever perfectly still.
    this._camPos.x += Math.sin(time * 0.16) * 0.9;
    this._camPos.y += Math.cos(time * 0.13) * 0.6;

    engine.camera.position.lerp(this._camPos, 0.14);
    engine.camera.lookAt(this._lookAt);
  }

  refresh() {
    this.measure();
    this.createChapterTriggers();
    this.createMasterTimeline();
    ScrollTrigger.refresh();
  }

  dispose() {
    this.masterTimeline?.kill();
    this.chapterTriggers.forEach((t) => t.kill());
    this.chapters.forEach((entry) => entry.station.dispose?.());
  }
}

function engineStationZ(station) {
  return station?.baseZ ?? 0;
}
