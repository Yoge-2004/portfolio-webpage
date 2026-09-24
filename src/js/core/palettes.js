/**
 * PALETTE & ATMOSPHERE
 * --------------------
 * The colour story. Each chapter owns a lighting + atmosphere state so the
 * world changes as the visitor travels, rather than sitting in one gradient.
 * Deliberately avoids the black-background / neon-blue-purple cliché: the
 * palette is warm, editorial and art-directed, with a distinct identity per
 * chapter.
 */

export const PALETTES = {
  dusk: {
    /** 01 — Arrival. Indigo night with a pale gold horizon. */
    bg: "#0d1024",
    fog: "#131a38",
    fogDensity: 0.055,
    key: "#ffd9a0",
    keyIntensity: 1.15,
    rim: "#7f9cff",
    rimIntensity: 0.85,
    fill: "#3b4a8c",
    fillIntensity: 0.55,
    ambient: "#4a5aa0",
    ambientIntensity: 0.5,
    accent: "#ffd9a0",
    accentEmissive: "#ffb347",
    ui: "#f4efe6",
    uiMuted: "rgba(244, 239, 230, 0.62)",
    uiAccent: "#ffd9a0",
  },
  terracotta: {
    /** 02 — The Person. Warm, human, lamplit. */
    bg: "#241612",
    fog: "#2e1c15",
    fogDensity: 0.06,
    key: "#ffc79a",
    keyIntensity: 1.35,
    rim: "#ff8a5c",
    rimIntensity: 0.9,
    fill: "#8c4a32",
    fillIntensity: 0.6,
    ambient: "#7a4632",
    ambientIntensity: 0.55,
    accent: "#ffb27a",
    accentEmissive: "#ff7a3c",
    ui: "#fbf1e6",
    uiMuted: "rgba(251, 241, 230, 0.64)",
    uiAccent: "#ffb27a",
  },
  signal: {
    /** 03 — The Research. Analytical teal with a coral alert accent. */
    bg: "#07201f",
    fog: "#0a2b2a",
    fogDensity: 0.05,
    key: "#bff6f0",
    keyIntensity: 1.25,
    rim: "#3ee0c8",
    rimIntensity: 1.0,
    fill: "#1c6f68",
    fillIntensity: 0.6,
    ambient: "#2a7d75",
    ambientIntensity: 0.5,
    accent: "#ff7a6b",
    accentEmissive: "#ff5c47",
    ui: "#eefaf7",
    uiMuted: "rgba(238, 250, 247, 0.62)",
    uiAccent: "#5cf0d4",
  },
  bronze: {
    /** 04 — The Path. Bronze, dusted, archival. */
    bg: "#1d1710",
    fog: "#262013",
    fogDensity: 0.052,
    key: "#ffe0ae",
    keyIntensity: 1.2,
    rim: "#d9a05b",
    rimIntensity: 0.85,
    fill: "#7a5c2e",
    fillIntensity: 0.6,
    ambient: "#6b5330",
    ambientIntensity: 0.55,
    accent: "#ffcf87",
    accentEmissive: "#e09a3c",
    ui: "#f7efe0",
    uiMuted: "rgba(247, 239, 224, 0.6)",
    uiAccent: "#ffcf87",
  },
  ember: {
    /** 05 — Proving Grounds. Pressure, heat, competition. */
    bg: "#26100c",
    fog: "#331510",
    fogDensity: 0.058,
    key: "#ffd2b0",
    keyIntensity: 1.3,
    rim: "#ff5f3c",
    rimIntensity: 1.05,
    fill: "#8f2f1c",
    fillIntensity: 0.7,
    ambient: "#8a3a24",
    ambientIntensity: 0.55,
    accent: "#ff8a4c",
    accentEmissive: "#ff4d24",
    ui: "#fdeee4",
    uiMuted: "rgba(253, 238, 228, 0.62)",
    uiAccent: "#ff9a5c",
  },
  copper: {
    /** 06 — Technical World. Structured, metallic, engineered. */
    bg: "#101a1a",
    fog: "#152323",
    fogDensity: 0.046,
    key: "#d8f4ec",
    keyIntensity: 1.15,
    rim: "#2fd4b4",
    rimIntensity: 0.95,
    fill: "#b0653a",
    fillIntensity: 0.55,
    ambient: "#2c4a48",
    ambientIntensity: 0.5,
    accent: "#f0a35e",
    accentEmissive: "#e0782c",
    ui: "#eaf7f3",
    uiMuted: "rgba(234, 247, 243, 0.6)",
    uiAccent: "#4fe3c4",
  },
  violet: {
    /** 07 — Capabilities. Instrumentation, precise, cool. */
    bg: "#141026",
    fog: "#1b1636",
    fogDensity: 0.05,
    key: "#e4dcff",
    keyIntensity: 1.2,
    rim: "#9b7cff",
    rimIntensity: 0.9,
    fill: "#5b3fa8",
    fillIntensity: 0.6,
    ambient: "#4a3a7d",
    ambientIntensity: 0.5,
    accent: "#c4a6ff",
    accentEmissive: "#8b5cf6",
    ui: "#f1ecff",
    uiMuted: "rgba(241, 236, 255, 0.6)",
    uiAccent: "#b99cff",
  },
  prism: {
    /** 08 — The Worlds. A deep teal-green night, clearly distinct from the
     * cool violet of Ch 07 — you should *feel* the world change here. */
    bg: "#0a1a1e",
    fog: "#0d262a",
    fogDensity: 0.044,
    key: "#fff0d6",
    keyIntensity: 1.35,
    rim: "#4fd6c4",
    rimIntensity: 0.95,
    fill: "#ffb35c",
    fillIntensity: 0.55,
    ambient: "#1f4a48",
    ambientIntensity: 0.52,
    accent: "#ffd166",
    accentEmissive: "#ffb020",
    ui: "#f6f1ff",
    uiMuted: "rgba(246, 241, 255, 0.62)",
    uiAccent: "#ffd166",
  },
  dawn: {
    /** 09 — The Next Chapter. A warm, resolved plum-coral dawn — noticeably
     * lighter and warmer than every prior chapter, so the ending lands. */
    bg: "#2c1a22",
    fog: "#3a222c",
    fogDensity: 0.036,
    key: "#ffe9d6",
    keyIntensity: 1.5,
    rim: "#ff9e7d",
    rimIntensity: 0.95,
    fill: "#c47088",
    fillIntensity: 0.5,
    ambient: "#7a5460",
    ambientIntensity: 0.6,
    accent: "#ff9e7d",
    accentEmissive: "#ff7a52",
    ui: "#fdf0ea",
    uiMuted: "rgba(253, 240, 234, 0.6)",
    uiAccent: "#ff9e7d",
  },
};

/** Per-project accent hues for chapter 08 — spread across the wheel
 *  (teal → cyan → amber) so the three worlds never read as one colour and
 *  none collides with the Ch 07 violet. */
export const PROJECT_HUES = {
  signal: { primary: "#5cf0d4", secondary: "#ff7a6b", emissive: "#19b89c" },
  diary: { primary: "#59d0ff", secondary: "#8affd0", emissive: "#2a9fe0" },
  ledger: { primary: "#ffb04d", secondary: "#ffd98a", emissive: "#e08a1e" },
};

/**
 * LIGHT_PALETTES — the same chapter identities re-lit for day.
 * Backgrounds/fog go to luminous paper tones while accents stay in the same
 * hue family (deepened for contrast), so the story's colour journey survives
 * the theme switch.
 */
export const LIGHT_PALETTES = {
  dusk: {
    bg: "#e6e9fa", fog: "#dfe3f5", fogDensity: 0.055,
    key: "#fff6e2", keyIntensity: 1.1, rim: "#6f86ff", rimIntensity: 0.7,
    fill: "#8b98c9", fillIntensity: 0.5, ambient: "#8b98c9", ambientIntensity: 0.6,
    accent: "#8a6a00", accentEmissive: "#c78f00",
    ui: "#1c2033", uiMuted: "rgba(28,32,51,0.66)", uiAccent: "#8a6a00",
  },
  terracotta: {
    bg: "#f8ece1", fog: "#f2e2d0", fogDensity: 0.06,
    key: "#ffffff", keyIntensity: 1.1, rim: "#e0651f", rimIntensity: 0.7,
    fill: "#b98a63", fillIntensity: 0.5, ambient: "#b98a63", ambientIntensity: 0.6,
    accent: "#b35314", accentEmissive: "#d96a1e",
    ui: "#2a1a12", uiMuted: "rgba(42,26,18,0.66)", uiAccent: "#b35314",
  },
  signal: {
    bg: "#e7f5ef", fog: "#dff0e9", fogDensity: 0.05,
    key: "#ffffff", keyIntensity: 1.1, rim: "#0aa884", rimIntensity: 0.75,
    fill: "#5fa695", fillIntensity: 0.5, ambient: "#5fa695", ambientIntensity: 0.6,
    accent: "#0b6e5f", accentEmissive: "#0f9c86",
    ui: "#0c2220", uiMuted: "rgba(12,34,32,0.66)", uiAccent: "#0b6e5f",
  },
  bronze: {
    bg: "#f6ecd7", fog: "#efe4c8", fogDensity: 0.052,
    key: "#ffffff", keyIntensity: 1.1, rim: "#b57e1e", rimIntensity: 0.7,
    fill: "#a68a52", fillIntensity: 0.5, ambient: "#a68a52", ambientIntensity: 0.6,
    accent: "#8a5f06", accentEmissive: "#bd830c",
    ui: "#241c0c", uiMuted: "rgba(36,28,12,0.66)", uiAccent: "#8a5f06",
  },
  ember: {
    bg: "#f9e9df", fog: "#f3ddd0", fogDensity: 0.058,
    key: "#ffffff", keyIntensity: 1.1, rim: "#d94a1e", rimIntensity: 0.75,
    fill: "#c08a72", fillIntensity: 0.5, ambient: "#c08a72", ambientIntensity: 0.6,
    accent: "#b73a10", accentEmissive: "#e05a24",
    ui: "#2b130c", uiMuted: "rgba(43,19,12,0.66)", uiAccent: "#b73a10",
  },
  copper: {
    bg: "#e5f2ee", fog: "#dcebe6", fogDensity: 0.046,
    key: "#ffffff", keyIntensity: 1.1, rim: "#0a9c86", rimIntensity: 0.75,
    fill: "#6fa396", fillIntensity: 0.5, ambient: "#6fa396", ambientIntensity: 0.6,
    accent: "#0a6e60", accentEmissive: "#0f9c87",
    ui: "#0e1e1c", uiMuted: "rgba(14,30,28,0.66)", uiAccent: "#0a6e60",
  },
  violet: {
    bg: "#e7e3fb", fog: "#ddd7f5", fogDensity: 0.05,
    key: "#ffffff", keyIntensity: 1.1, rim: "#6a4ad6", rimIntensity: 0.7,
    fill: "#8f7cc9", fillIntensity: 0.5, ambient: "#8f7cc9", ambientIntensity: 0.6,
    accent: "#5b3fd4", accentEmissive: "#7a5cf0",
    ui: "#1b1440", uiMuted: "rgba(27,20,64,0.66)", uiAccent: "#5b3fd4",
  },
  prism: {
    bg: "#e4f1ed", fog: "#d8ebe6", fogDensity: 0.044,
    key: "#ffffff", keyIntensity: 1.15, rim: "#0a8fa0", rimIntensity: 0.75,
    fill: "#d8a24a", fillIntensity: 0.5, ambient: "#5f8a84", ambientIntensity: 0.6,
    accent: "#8f6600", accentEmissive: "#c08a00",
    ui: "#12201e", uiMuted: "rgba(18,32,30,0.66)", uiAccent: "#8f6600",
  },
  dawn: {
    bg: "#fbf0e2", fog: "#f7e6cd", fogDensity: 0.036,
    key: "#ffffff", keyIntensity: 1.15, rim: "#e0651f", rimIntensity: 0.75,
    fill: "#c08a6a", fillIntensity: 0.5, ambient: "#c08a6a", ambientIntensity: 0.6,
    accent: "#bd5227", accentEmissive: "#e06a35",
    ui: "#2b130c", uiMuted: "rgba(43,19,12,0.66)", uiAccent: "#bd5227",
  },
};

/** Reads the active colour theme (default: dark). */
export function themeOf() {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/** Theme-aware palette lookup — falls back to dusk when unknown. */
export function paletteFor(id, theme = themeOf()) {
  const set = theme === "light" ? LIGHT_PALETTES : PALETTES;
  return set[id] ?? set.dusk;
}

/** Background hex for a palette id in a theme (used for tab colour). */
export function themeBg(paletteId, theme = themeOf()) {
  return paletteFor(paletteId, theme).bg;
}
