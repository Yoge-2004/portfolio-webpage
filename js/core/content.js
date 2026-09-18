/**
 * Canonical Portfolio Content Model & Information Architecture
 * Authoritative single source of truth for all chapters, navigation targets,
 * section tags, HUD telemetry readouts, and 3D world scene states.
 */

export const CANONICAL_CHAPTERS = [
  {
    id: 'prologue',
    number: '01',
    label: 'Prologue',
    navLabel: '01 Prologue',
    tag: 'Chapter 01 // Archival Portal',
    heading: 'Yogeshwaran Muthuraman',
    hudTitle: 'PROLOGUE',
    hudIndex: 'CH. 01',
    domTarget: '#prologue',
    worldScene: 'prologue',
    cameraZ: 4.0,
    purpose: 'Architectural threshold, verification identity, and four-metric summary ledger',
    narrativeRole: 'Enter: The inspector arrives at the subterranean verification archive'
  },
  {
    id: 'origin',
    number: '02',
    label: 'Origin',
    navLabel: '02 Origin',
    tag: 'Chapter 02 // Foundation & Philosophy',
    heading: 'Research keeps the engineering honest.',
    hudTitle: 'ORIGIN',
    hudIndex: 'CH. 02',
    domTarget: '#origin',
    worldScene: 'origin',
    cameraZ: -32.0,
    purpose: 'Engineering philosophy, academic credentials (Panimalar, 9.37 CGPA), internship experience',
    narrativeRole: 'Discover: Formative foundations and engineering ethics'
  },
  {
    id: 'discovery',
    number: '03',
    label: 'Discovery',
    navLabel: '03 Discovery',
    tag: 'Chapter 03 // Peer-Reviewed Research',
    heading: 'Teaching a machine to recognise a lie.',
    hudTitle: 'DISCOVERY',
    hudIndex: 'CH. 03',
    domTarget: '#discovery',
    worldScene: 'discovery',
    cameraZ: -44.0,
    purpose: 'ICISD\'26 conference research on fake recruitment detection via Neuro-Symbolic ML',
    narrativeRole: 'Inspect: The central analytical breakthrough in fraud detection'
  },
  {
    id: 'quests',
    number: '04',
    label: 'Quests',
    navLabel: '04 Quests',
    tag: 'Chapter 04 // Exhibition Plinths',
    heading: 'Engineered systems deployed in the open.',
    hudTitle: 'QUESTS',
    hudIndex: 'CH. 04',
    domTarget: '#quests',
    worldScene: 'quests',
    cameraZ: -70.0,
    purpose: 'Three major production systems (Fake Job Detection, Digital Diary, Expense Tracker) and secondary works',
    narrativeRole: 'Encounter: Tangible production artifacts deployed in real environments'
  },
  {
    id: 'arena',
    number: '05',
    label: 'Arena',
    navLabel: '05 Arena',
    tag: 'Chapter 05 // Competitive Proving Grounds',
    heading: 'Where deadlines are uncompromising.',
    hudTitle: 'ARENA',
    hudIndex: 'CH. 05',
    domTarget: '#arena',
    worldScene: 'arena',
    cameraZ: -98.0,
    purpose: 'High-stakes hackathons (Naan Mudhalvan, Web-A-Thon, Hack4Purpose, Octanet)',
    narrativeRole: 'Crucible: Verification under intense temporal and competitive constraints'
  },
  {
    id: 'capability',
    number: '06',
    label: 'Capability',
    navLabel: '06 Capability',
    tag: 'Chapter 06 // Technical Arsenal',
    heading: 'Production capabilities and technical stack.',
    hudTitle: 'CAPABILITY',
    hudIndex: 'CH. 06',
    domTarget: '#capability',
    worldScene: 'capability',
    cameraZ: -114.0,
    purpose: 'Calibrated skills matrix, enterprise tool stack, and verified certifications',
    narrativeRole: 'Instrument: Calibrated inventory of production tools and verified skills'
  },
  {
    id: 'path',
    number: '07',
    label: 'Path',
    navLabel: '07 Path',
    tag: 'Chapter 07 // Milestone Chronology',
    heading: 'Chronological progression.',
    hudTitle: 'PATH',
    hudIndex: 'CH. 07',
    domTarget: '#path',
    worldScene: 'path',
    cameraZ: -134.0,
    purpose: 'Chronological career, academic, and publication milestones from 2019 to present',
    narrativeRole: 'Journey: Spatial passage through time from secondary school to publication'
  },
  {
    id: 'contact',
    number: '08',
    label: 'Contact',
    navLabel: '08 Contact',
    tag: 'Chapter 08 // Horizon Atrium',
    heading: 'Tell me what you\'re building.',
    hudTitle: 'CONTACT',
    hudIndex: 'CH. 08',
    domTarget: '#contact',
    worldScene: 'contact',
    cameraZ: -160.0,
    purpose: 'Direct communication channels, GitHub, LinkedIn, and credentials download',
    narrativeRole: 'Arrival: The destination, resolution, and open collaboration terminal'
  }
];

export function getChapterById(id) {
  return CANONICAL_CHAPTERS.find(ch => ch.id === id) || null;
}

export function getChapterByDomTarget(target) {
  return CANONICAL_CHAPTERS.find(ch => ch.domTarget === target) || null;
}

export function getChapterByIndex(idx) {
  return CANONICAL_CHAPTERS.find(ch => ch.hudIndex === idx) || null;
}

export function getChapterByNumber(num) {
  return CANONICAL_CHAPTERS.find(ch => ch.number === num) || null;
}
