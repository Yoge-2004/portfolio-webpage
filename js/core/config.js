/**
 * Core Application & 3D Scene Configuration
 */

export const COLORS = {
  void: 0x070706,
  obsidian: 0x0D0C0A,
  graphite: 0x211C16,
  bronze: 0x30261D,
  bone: 0xF2EADF,
  mutedBone: 0xB9AA97,
  softWhite: 0xFFF9F1,
  brass: 0xD7AA61,
  lightBrass: 0xF0C98B,
  copper: 0xB96542,
  ember: 0xD87950
};

export const WAYPOINTS = [
  [0, 1.2, 4],          // Prologue Entrance
  [0.9, 1.1, -16],      // Approaching Origin Ledger
  [-0.8, 1.0, -32],     // Arriving at Origin
  [-1.2, 1.3, -44],     // Slowing down at Research Chamber
  [1.4, 1.0, -58],      // Glancing at Exhibit 01 (Fake Job Detection)
  [-1.4, 1.0, -70],     // Turning toward Exhibit 02 (Digital Diary)
  [1.3, 1.0, -82],      // Approaching Exhibit 03 (Expense Tracker)
  [0, 1.2, -98],        // Passing through Arena Proving Grounds
  [-0.6, 1.1, -114],    // Entering Capability Instrumentation Bay
  [0.5, 0.9, -128],     // Gliding along Path Guide Rail
  [0, 1.4, -144],       // Approaching the Horizon Chamber
  [0, 1.5, -160]        // Open Horizon Destination
];

export const EXHIBIT_CONFIGS = [
  { z: -58, side: -1, shotIdx: 0, title: 'Fake Job Detection' },
  { z: -70, side: 1, shotIdx: 1, title: 'Digital Diary' },
  { z: -82, side: -1, shotIdx: 2, title: 'Expense Tracker' }
];

export const EXHIBIT_PREVIEWS = [
  {
    tag: 'ML-SYSTEM // CLASSIFIER',
    state: 'DISTILBERT + ISOLATION FOREST',
    title: ['PASTE JOB LISTING', 'VERIFY RECRUITMENT FRAUD'],
    bars: [0.88, 0.99, 0.999],
    metrics: ['ACCURACY: 99%', 'F1: 99.00', 'ROC-AUC: 99.99'],
    accent: '#f97316'
  },
  {
    tag: 'SECURITY // ZERO-FRAMEWORK',
    state: 'HTTPONLY SECURE COOKIES',
    title: ['PRIVATE JOURNALING', 'CRYPTOGRAPHIC STORAGE'],
    bars: [0.72, 0.64, 0.85],
    metrics: ['AUTH: JWT TOKENS', 'DB: POSTGRESQL', 'API: FASTAPI'],
    accent: '#06b6d4'
  },
  {
    tag: 'ENTERPRISE // REST API',
    state: 'JAVA 17 + SPRING BOOT',
    title: ['PERSONAL CAPITAL', 'BUDGETARY GOALS & REPORTS'],
    bars: [0.55, 0.82, 0.68],
    metrics: ['BACKEND: SPRING BOOT', 'RDBMS: MYSQL', 'CLIENT: NETLIFY'],
    accent: '#f59e0b'
  }
];

export const MILESTONE_Z_STOPS = [-126, -130, -134, -138, -142];

export const ARENA_TRUSS_STOPS = [-98, -101.8, -105.6, -109.4];

export const ENVIRONMENT_CONFIG = {
  totalLength: 168,
  getSegments: isMobile => (isMobile ? 56 : 96),
  getParticleCount: isMobile => (isMobile ? 80 : 280)
};
