/**
 * CHAPTER REGISTRY — SINGLE SOURCE OF TRUTH
 * ----------------------------------------
 * Every chapter number, slug, title and subtitle in this project is derived
 * from this file. Top navigation, the chapter rail, the progress HUD, the
 * scroll choreography and the 3D scene stations all read from here, so a
 * mismatch between "Chapter 04" in the nav and the actual section is
 * structurally impossible.
 *
 * `scene` keys map to builders registered in src/js/scenes/stations.js
 * `palette` keys map to lighting/atmosphere states in src/js/core/environment.js
 */

export const CHAPTERS = [
  {
    id: "arrival",
    index: 1,
    numeral: "01",
    nav: "Arrival",
    title: "The Arrival",
    repoTitle: "Archival Portal",
    kicker: "Chapter 01 // Archival Portal",
    lede: "I build software systems that tell the difference between what is real and what only looks real.",
    scene: "arrival",
    palette: "dusk",
  },
  {
    id: "person",
    index: 2,
    numeral: "02",
    nav: "The Person",
    title: "The Person",
    repoTitle: "Foundation & Philosophy",
    kicker: "Chapter 02 // Foundation & Philosophy",
    lede: "Research keeps the engineering honest.",
    scene: "person",
    palette: "terracotta",
  },
  {
    id: "research",
    index: 3,
    numeral: "03",
    nav: "The Research",
    title: "The Research",
    repoTitle: "Peer-Reviewed Research",
    kicker: "Chapter 03 // Peer-Reviewed Research",
    lede: "Teaching a machine to recognise a lie.",
    scene: "research",
    palette: "signal",
  },
  {
    id: "path",
    index: 4,
    numeral: "04",
    nav: "The Path",
    title: "The Path",
    repoTitle: "Spatial Progression",
    kicker: "Chapter 04 // Spatial Progression",
    lede: "Chronological progression.",
    scene: "path",
    palette: "bronze",
  },
  {
    id: "arena",
    index: 5,
    numeral: "05",
    nav: "Proving Grounds",
    title: "The Proving Grounds",
    repoTitle: "Arena",
    kicker: "Chapter 05 // Arena (Proving Grounds)",
    lede: "Where deadlines are uncompromising.",
    scene: "arena",
    palette: "ember",
  },
  {
    id: "technical",
    index: 6,
    numeral: "06",
    nav: "Technical World",
    title: "The Technical World",
    repoTitle: "Technical World & Production Systems",
    kicker: "Chapter 06 // Technical World & Production Systems",
    lede: "Engineered systems deployed in the open.",
    scene: "technical",
    palette: "copper",
  },
  {
    id: "capabilities",
    index: 7,
    numeral: "07",
    nav: "Capabilities",
    title: "Capabilities",
    repoTitle: "Capability & Instrumentation",
    kicker: "Chapter 07 // Capability & Instrumentation",
    lede: "Production capabilities and technical stack.",
    scene: "capabilities",
    palette: "violet",
  },
  {
    id: "worlds",
    index: 8,
    numeral: "08",
    nav: "The Worlds",
    title: "The Worlds",
    repoTitle: "Production Systems",
    kicker: "Chapter 08 // Production Systems",
    lede: "Systems that survive being used by people who didn't build them.",
    scene: "worlds",
    palette: "prism",
  },
  {
    id: "horizon",
    index: 9,
    numeral: "09",
    nav: "Next Chapter",
    title: "The Next Chapter",
    repoTitle: "Horizon Atrium",
    kicker: "Chapter 09 // Horizon Atrium",
    lede: "Tell me what you're building.",
    scene: "horizon",
    palette: "dawn",
  },
];

export const TOTAL_CHAPTERS = CHAPTERS.length;

/** Total scroll length of the story, in viewport heights. */
export const STORY_LENGTH_VH = CHAPTERS.length * 115;

export function chapterByIndex(index) {
  return CHAPTERS[index - 1] ?? null;
}

export function chapterById(id) {
  return CHAPTERS.find((c) => c.id === id) ?? null;
}
