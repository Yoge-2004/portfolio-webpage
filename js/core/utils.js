/**
 * Mathematical and formatting utilities
 */

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function smoothstep(min, max, val) {
  const x = clamp((val - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
}

export function padZero(num, size = 2) {
  let s = String(num);
  while (s.length < size) s = '0' + s;
  return s;
}
