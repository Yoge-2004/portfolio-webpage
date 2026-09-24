import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runAudit() {
  console.log('🚀 Running Comprehensive Audit for Yogeshwaran Muthuraman Portfolio...\n');
  let failures = 0;

  // 1. Verify Canonical Information Architecture & Validator
  console.log('--- TEST 1: Architecture & Chapter Consistency Validator ---');
  const htmlContent = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
  const dom = new JSDOM(htmlContent);
  global.document = dom.window.document;
  global.window = dom.window;

  try {
    const { validateChapterConsistency } = await import('./js/core/validator.js');
    const isValid = validateChapterConsistency();
    if (isValid) {
      console.log('✅ validateChapterConsistency passed with 0 discrepancies.');
    } else {
      console.error('❌ validateChapterConsistency returned false.');
      failures++;
    }
  } catch (err) {
    console.error('❌ Validator exception:', err.message);
    failures++;
  }

  // 2. Verify Canonical 8 Chapters in DOM
  console.log('\n--- TEST 2: Canonical 8 Chapters Structure ---');
  const expectedChapters = [
    { id: 'prologue', num: '01', name: 'Prologue' },
    { id: 'origin', num: '02', name: 'Origin' },
    { id: 'discovery', num: '03', name: 'Discovery' },
    { id: 'quests', num: '04', name: 'Quests' },
    { id: 'arena', num: '05', name: 'Arena' },
    { id: 'capability', num: '06', name: 'Capability' },
    { id: 'path', num: '07', name: 'Path' },
    { id: 'contact', num: '08', name: 'Contact' }
  ];

  expectedChapters.forEach(ch => {
    const section = dom.window.document.getElementById(ch.id);
    const navLink = dom.window.document.querySelector(`nav.nav a[data-target="${ch.id}"]`);
    const mobileLink = dom.window.document.querySelector(`#sheet a[href="#${ch.id}"]`);

    if (!section) {
      console.error(`❌ Missing section #${ch.id}`);
      failures++;
    } else if (!navLink) {
      console.error(`❌ Missing desktop nav link for #${ch.id}`);
      failures++;
    } else if (!mobileLink) {
      console.error(`❌ Missing mobile nav link for #${ch.id}`);
      failures++;
    } else {
      console.log(`✅ Chapter ${ch.num} (${ch.name}): Section, desktop nav & mobile drawer verified.`);
    }
  });

  // 3. Verify Artifacts, Resume, and Certificate Files
  console.log('\n--- TEST 3: Documented Credentials & Certificate Files ---');
  const requiredFiles = [
    'Yogeshwaran Resume.pdf',
    'python_GFG.pdf',
    'web_certificate_coursera.pdf',
    'java_scaler.jpg',
    'cloud_tcs.pdf',
    'c_udemy.pdf',
    'c++_scaler.png',
    'sql_udemy.pdf',
    'internship_certificate_robowaves.pdf',
    'srm_hackathon_certificate.jpg'
  ];

  requiredFiles.forEach(f => {
    const exists = fs.existsSync(path.join(__dirname, f));
    if (!exists) {
      console.error(`❌ Missing required asset: ${f}`);
      failures++;
    } else {
      console.log(`✅ File verified: ${f}`);
    }
  });

  // 4. Verify Error Pages (400, 401, 403, 404, 500, 503)
  console.log('\n--- TEST 4: Dedicated Error Pages ---');
  const errorPages = ['400.html', '401.html', '403.html', '404.html', '500.html', '503.html'];
  errorPages.forEach(ep => {
    const exists = fs.existsSync(path.join(__dirname, ep));
    if (!exists) {
      console.error(`❌ Missing error page: ${ep}`);
      failures++;
    } else {
      console.log(`✅ Error page exists: ${ep}`);
    }
  });

  // 5. Test Live HTTP Server Endpoints
  console.log('\n--- TEST 5: Live HTTP Server Status Codes ---');
  const routesToTest = [
    { path: '/', expected: 200, type: 'text/html' },
    { path: '/400', expected: 400, type: 'text/html' },
    { path: '/401', expected: 401, type: 'text/html' },
    { path: '/403', expected: 403, type: 'text/html' },
    { path: '/404', expected: 404, type: 'text/html' },
    { path: '/500', expected: 500, type: 'text/html' },
    { path: '/503', expected: 503, type: 'text/html' },
    { path: '/Yogeshwaran%20Resume.pdf', expected: 200, type: 'application/pdf' },
    { path: '/css/tokens.css', expected: 200, type: 'text/css' },
    { path: '/js/main.js', expected: 200, type: 'application/javascript' }
  ];

  for (const r of routesToTest) {
    try {
      const res = await fetch(`http://127.0.0.1:3000${r.path}`);
      if (res.status !== r.expected) {
        console.error(`❌ Route ${r.path}: expected status ${r.expected}, got ${res.status}`);
        failures++;
      } else {
        console.log(`✅ Route ${r.path}: Status ${res.status} [${res.headers.get('content-type')}]`);
      }
    } catch (err) {
      console.error(`❌ Failed to fetch ${r.path}:`, err);
      failures++;
    }
  }

  console.log(`\n========================================`);
  if (failures === 0) {
    console.log(`🏆 ALL QUALITY & CONSISTENCY AUDITS PASSED WITH ZERO FAILURES!`);
  } else {
    console.error(`⚠️ Found ${failures} audit failure(s).`);
    process.exit(1);
  }
}

runAudit();
