/**
 * UTILITIES
 * ---------
 * Small, dependency-free helpers shared across the engine, the scene
 * builders and the interaction layer.
 */

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a, b, t) => a + (b - a) * t;

/** Maps `v` from [inMin,inMax] to [outMin,outMax], clamped. */
export function mapRange(v, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return outMin;
  return lerp(outMin, outMax, clamp((v - inMin) / (inMax - inMin)));
}

/** 0..1 ramp used for local chapter progress with eased edges. */
export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-6));
  return t * t * (3 - 2 * t);
}

export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function prefersReducedMotion() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isTouchPrimary() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

/** Coarse device tier used to scale geometry, particles and pixel ratio. */
export function deviceTier() {
  if (typeof window === "undefined") return "high";
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = navigator.deviceMemory ?? 4;
  if (w <= 480 || cores <= 4 || mem <= 2) return "low";
  if (w <= 1024 || cores <= 6) return "mid";
  return "high";
}

export function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

/** Formats "0x" style ordinal labels consistently. */
export const pad2 = (n) => String(n).padStart(2, "0");

/** rAF-throttled callback helper. */
export function onResize(fn) {
  let frame = 0;
  const handler = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fn);
  };
  window.addEventListener("resize", handler, { passive: true });
  window.addEventListener("orientationchange", handler, { passive: true });
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", handler);
    window.removeEventListener("orientationchange", handler);
  };
}

/** Converts a hex colour to a normalized [r,g,b] tuple for shader uniforms. */
export function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const int = parseInt(full, 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
}

/** Parses "rgb(r, g, b)" / "rgba(...)" strings. */
export function rgbStringToRgb(value) {
  const nums = value.match(/[\d.]+/g);
  if (!nums) return [1, 1, 1];
  return [Number(nums[0]) / 255, Number(nums[1]) / 255, Number(nums[2]) / 255];
}
