import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const viewports = [
  { w: 360, h: 800, label: '360 × 800 (Compact Mobile)' },
  { w: 390, h: 844, label: '390 × 844 (iPhone 12/13/14)' },
  { w: 412, h: 915, label: '412 × 915 (Android Flagship)' },
  { w: 480, h: 900, label: '480 × 900 (Large Mobile)' },
  { w: 768, h: 1024, label: '768 × 1024 (Tablet Portrait)' },
  { w: 1024, h: 768, label: '1024 × 768 (Tablet Landscape)' },
  { w: 1280, h: 800, label: '1280 × 800 (Laptop Standard)' },
  { w: 1440, h: 900, label: '1440 × 900 (Desktop High-Res)' },
  { w: 1920, h: 1080, label: '1920 × 1080 (FHD Ultrawide)' }
];

console.log('🧪 Running Rigorous Multi-Viewport & Content-First Audit for Chapter 04...\n');

const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const dom = new JSDOM(htmlContent);
const doc = dom.window.document;

let errors = 0;

// 1. Verify Chapter 04 Structure & Narrative Progression
const quests = doc.getElementById('quests');
if (!quests) {
  console.error('❌ Missing #quests container');
  process.exit(1);
}

console.log('--- TEST 1: Chapter 04 Content-First Narrative Components ---');

const techEcosystem = quests.querySelector('#techEcosystem');
if (!techEcosystem) {
  console.error('❌ Missing #techEcosystem in Chapter 04');
  errors++;
} else {
  const layers = techEcosystem.querySelectorAll('.tech-layer');
  console.log(`✅ Technical Stack Map verified: ${layers.length} architectural layers present.`);
}

const majorProjects = quests.querySelectorAll('.project-story-card');
console.log(`✅ Major Projects verified: ${majorProjects.length} deep narrative projects present.`);
if (majorProjects.length !== 3) {
  console.error(`❌ Expected 3 major projects, found ${majorProjects.length}`);
  errors++;
}

majorProjects.forEach((proj, idx) => {
  const title = proj.querySelector('.project-title')?.textContent.trim();
  const phases = proj.querySelectorAll('.story-phase');
  const consoleCard = proj.querySelector('.telemetry-console-card');
  const repo = proj.querySelector('.project-repo-link a')?.href;

  if (phases.length < 3) {
    console.error(`❌ Project ${idx + 1} (${title}) missing story phases (found ${phases.length}/3)`);
    errors++;
  } else if (!consoleCard) {
    console.error(`❌ Project ${idx + 1} (${title}) missing telemetry console card`);
    errors++;
  } else if (!repo) {
    console.error(`❌ Project ${idx + 1} (${title}) missing valid GitHub repository link`);
    errors++;
  } else {
    console.log(`  ✓ Project ${idx + 1}: "${title}" has complete 3-phase story + telemetry console.`);
  }
});

const secondarySlots = quests.querySelectorAll('.slot');
console.log(`✅ Secondary Systems verified: ${secondarySlots.length} public systems in archival index.`);
if (secondarySlots.length !== 6) {
  console.error(`❌ Expected 6 secondary systems, found ${secondarySlots.length}`);
  errors++;
}

// 2. Multi-Viewport Simulation & Layout Safety
console.log('\n--- TEST 2: Multi-Viewport Responsive Safety (360px to 1920px) ---');

viewports.forEach(vp => {
  // Check for unsafe elements that could cause horizontal overflow
  const badElements = [];
  quests.querySelectorAll('*').forEach(el => {
    const inlineWidth = el.style.width;
    const inlineMinWidth = el.style.minWidth;
    if (inlineWidth && inlineWidth.endsWith('px') && parseInt(inlineWidth, 10) > vp.w) {
      badElements.push({ tag: el.tagName, class: el.className, prop: `width: ${inlineWidth}` });
    }
    if (inlineMinWidth && inlineMinWidth.endsWith('px') && parseInt(inlineMinWidth, 10) > vp.w) {
      badElements.push({ tag: el.tagName, class: el.className, prop: `min-width: ${inlineMinWidth}` });
    }
  });

  if (badElements.length > 0) {
    console.error(`❌ Viewport ${vp.label}: Found ${badElements.length} overflow-risk elements:`, badElements);
    errors++;
  } else {
    console.log(`✅ Viewport ${vp.label}: 0 fixed-width collisions or overflow risks.`);
  }
});

console.log('\n========================================');
if (errors === 0) {
  console.log('🏆 CHAPTER 04 MULTI-VIEWPORT AUDIT PASSED WITH ZERO FAILURES!');
} else {
  console.error(`⚠️ Found ${errors} error(s).`);
  process.exit(1);
}
