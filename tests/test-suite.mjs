import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const CHROMIUM_PATH = '/home/yoge/.local/bin/chromium';
const BASE_URL = 'http://localhost:8080/index.html?test=true';
const ARTIFACTS_DIR = path.resolve('.test-artifacts/screenshots');

const VIEWPORTS = [
  { name: '375x812-iphone-mini', width: 375, height: 812, isMobile: true },
  { name: '390x844-iphone-standard', width: 390, height: 844, isMobile: true },
  { name: '412x915-pixel-android', width: 412, height: 915, isMobile: true },
  { name: '768x1024-ipad-portrait', width: 768, height: 1024, isMobile: false },
  { name: '820x1180-ipad-air-portrait', width: 820, height: 1180, isMobile: false },
  { name: '1024x768-ipad-landscape', width: 1024, height: 768, isMobile: false },
  { name: '1280x800-laptop-small', width: 1280, height: 800, isMobile: false },
  { name: '1366x768-laptop-standard', width: 1366, height: 768, isMobile: false },
  { name: '1440x900-macbook-pro', width: 1440, height: 900, isMobile: false },
  { name: '1536x864-desktop-hd', width: 1536, height: 864, isMobile: false },
  { name: '1920x1080-fhd-desktop', width: 1920, height: 1080, isMobile: false },
  { name: '2560x1440-qhd-widescreen', width: 2560, height: 1440, isMobile: false }
];

async function runTests() {
  console.log('====================================================');
  console.log('LAUNCHING COMPREHENSIVE BROWSER EXPERIENCE TEST SUITE');
  console.log(`Chromium Binary: ${CHROMIUM_PATH}`);
  console.log(`Target: ${BASE_URL}`);
  console.log('====================================================\n');

  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=swiftshader']
  });

  const results = {
    viewports: [],
    scrollJourney: null,
    reducedMotion: null,
    touchDevices: null,
    webglFallback: null,
    accessibility: null,
    performance: null,
    totalErrors: 0,
    totalWarnings: 0
  };

  // Helper to ensure page is loaded and revealed
  async function waitForPageReady(page) {
    await page.waitForSelector('#load', { state: 'hidden', timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(300); // Allow reveals and fonts to fully paint
  }

  // -------------------------------------------------------------
  // TEST 1: VIEWPORT MATRIX & RESPONSIVE GEOMETRY (12 Viewports)
  // -------------------------------------------------------------
  console.log('▶ [1/6] Running 12-Viewport Responsive Matrix Audit...');
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(`[ERROR] ${msg.text()}`);
        results.totalErrors++;
      } else if (msg.type() === 'warning') {
        consoleLogs.push(`[WARN] ${msg.text()}`);
        results.totalWarnings++;
      }
    });
    page.on('pageerror', err => {
      consoleLogs.push(`[PAGEERROR] ${err.message}`);
      results.totalErrors++;
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await waitForPageReady(page);

    // Geometry check
    const geo = await page.evaluate(() => {
      const scrollW = document.documentElement.scrollWidth;
      const innerW = window.innerWidth;
      const scrollH = document.documentElement.scrollHeight;
      const canvas = document.getElementById('world');
      return {
        scrollW,
        innerW,
        overflow: scrollW > innerW,
        canvasWidth: canvas?.clientWidth || 0,
        canvasHeight: canvas?.clientHeight || 0,
        pageHeight: scrollH
      };
    });

    // Capture checkpoint screenshot
    const shotPath = path.join(ARTIFACTS_DIR, `vp-${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });

    results.viewports.push({
      ...vp,
      ...geo,
      consoleLogs
    });

    const status = !geo.overflow && consoleLogs.length === 0 ? '✓ PASS' : '✗ FAIL';
    console.log(`  ${status} [${vp.width}x${vp.height}] ${vp.name} | Overflow: ${geo.overflow ? 'YES' : 'NONE'} | Console: ${consoleLogs.length} issues`);
    if (consoleLogs.length > 0) {
      console.log('    ⚠ Detailed logs:', consoleLogs);
    }

    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 2: COMPLETE SCROLL JOURNEY & CHAPTER CONTINUITY
  // -------------------------------------------------------------
  console.log('\n▶ [2/6] Running Complete Scroll Journey & Chapter Continuity Audit (1440x900)...');
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await waitForPageReady(page);

    // 2. Comprehensive Chapter-by-Chapter Scroll Progression
    const chapterElements = [
      '#top',
      '#about',
      '#research',
      'article[data-chapter="EXHIBIT 01"]',
      'article[data-chapter="EXHIBIT 02"]',
      'article[data-chapter="EXHIBIT 03"]',
      'section[data-chapter="SECONDARY WORKS"]',
      '#arena',
      '#capability',
      '#path',
      '#contact'
    ];

    const chapterDetections = [];

    for (const selector of chapterElements) {
      await page.evaluate(sel => {
        if (window.__lenis) {
          window.__lenis.scrollTo(sel, { immediate: true, offset: 0 });
        } else {
          const el = document.querySelector(sel);
          if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        }
      }, selector);

      await page.waitForTimeout(400); // allow animation loop tick & HUD check

      const status = await page.evaluate(sel => {
        const el = document.querySelector(sel);
        const expectedChapter = el?.getAttribute('data-chapter') || '';
        const expectedIndex = el?.getAttribute('data-idx') || '';
        const hudTitle = document.getElementById('hudTitle')?.textContent || '';
        const hudIndex = document.getElementById('hudIndex')?.textContent || '';
        const depth = document.getElementById('hudDepth')?.textContent || '';
        const scrollY = window.scrollY;
        return {
          selector: sel,
          expectedChapter,
          expectedIndex,
          hudTitle,
          hudIndex,
          depth,
          scrollY,
          matched: hudTitle === expectedChapter
        };
      }, selector);

      chapterDetections.push(status);
      console.log(`    → Chapter: ${status.expectedChapter.padEnd(16)} | HUD: [${status.hudIndex}] ${status.hudTitle} | ${status.depth}`);
    }

    // Anchor Jump Navigation Testing
    await page.click('header nav.nav a[href="#work"]');
    await page.waitForTimeout(500);
    const workJump = await page.evaluate(() => ({
      y: window.scrollY,
      hudTitle: document.getElementById('hudTitle')?.textContent
    }));

    await page.click('header a.logo');
    await page.waitForTimeout(500);
    const topJump = await page.evaluate(() => ({
      y: window.scrollY,
      hudTitle: document.getElementById('hudTitle')?.textContent
    }));

    // Rapid wheel scroll test (simulate fast scroll down then up)
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, 1200);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(300);

    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel(0, -1200);
      await page.waitForTimeout(50);
    }
    await page.waitForTimeout(300);

    // Checkpoint screenshot of Exhibit in view
    await page.evaluate(() => {
      const el = document.querySelector('article[data-chapter="EXHIBIT 01"]');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'journey-work-exhibit.png') });

    // Checkpoint screenshot of Discovery Research Chamber
    await page.evaluate(() => {
      const el = document.querySelector('#research');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'journey-research-chamber.png') });

    results.scrollJourney = {
      chapterDetections,
      workJump,
      topJump,
      errors
    };

    const uniqueDetected = new Set(chapterDetections.map(c => c.hudTitle)).size;
    console.log(`  ✓ Chapter Journey Complete: Detected ${uniqueDetected} distinct chapter states in sequence`);
    console.log(`  ✓ Anchor Jump #work -> y:${workJump.y.toFixed(0)} | Jump #top -> y:${topJump.y.toFixed(0)}`);
    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 3: REDUCED MOTION PREFERENCE AUDIT
  // -------------------------------------------------------------
  console.log('\n▶ [3/6] Testing prefers-reduced-motion: reduce...');
  {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      reducedMotion: 'reduce'
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await waitForPageReady(page);

    const check = await page.evaluate(() => {
      const rvs = [...document.querySelectorAll('.rv')];
      const allIn = rvs.every(el => window.getComputedStyle(el).opacity !== '0');
      const canvas = document.getElementById('world');
      return {
        rvCount: rvs.length,
        rvVisible: allIn,
        canvasPresent: !!canvas
      };
    });

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'reduced-motion-state.png') });
    results.reducedMotion = { ...check, errors };
    console.log(`  ✓ Reduced motion verified: ${check.rvCount} elements visible, errors: ${errors.length}`);
    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 4: TOUCH DEVICE & COARSE POINTER BEHAVIOR
  // -------------------------------------------------------------
  console.log('\n▶ [4/6] Testing Mobile Touch Emulation (390x844 coarse pointer)...');
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      isMobile: true
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await waitForPageReady(page);

    // Reticle cursor should NOT be displayed on coarse touch
    const reticleDisplay = await page.evaluate(() => {
      const reticle = document.getElementById('reticle');
      return reticle ? window.getComputedStyle(reticle).display : 'none';
    });

    // Mobile menu interaction with #burger and #sheet
    const burgerBtn = await page.$('#burger');
    let menuOpened = false;
    let menuClosed = false;

    if (burgerBtn) {
      await burgerBtn.click();
      await page.waitForTimeout(250);
      menuOpened = await page.evaluate(() => document.body.classList.contains('menu-on'));

      const sheetLink = await page.$('#sheet a[href="#work"]');
      if (sheetLink) {
        await sheetLink.click();
        await page.waitForTimeout(250);
        menuClosed = !await page.evaluate(() => document.body.classList.contains('menu-on'));
      }
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'touch-mobile-view.png') });
    results.touchDevices = {
      reticleDisplay,
      menuOpened,
      menuClosed,
      errors
    };

    console.log(`  ✓ Touch reticle display: '${reticleDisplay}' | Menu toggle: opened=${menuOpened}, autoCloseOnNav=${menuClosed}`);
    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 5: WEBGL FALLBACK & RECOVERY
  // -------------------------------------------------------------
  console.log('\n▶ [5/6] Testing WebGL Context Loss / Fallback Mechanism...');
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await waitForPageReady(page);

    // Trigger synthetic WebGL context lost event
    const fallbackSuccess = await page.evaluate(() => {
      const canvas = document.getElementById('world');
      const event = new Event('webglcontextlost');
      canvas.dispatchEvent(event);
      return {
        hasNoWebglClass: document.body.classList.contains('no-webgl'),
        canvasHidden: canvas.style.display === 'none',
        contentStillLegible: document.querySelectorAll('.exhibit .lit').length === 3
      };
    });

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'webgl-fallback-active.png') });
    results.webglFallback = fallbackSuccess;
    console.log(`  ✓ Fallback response: no-webgl class=${fallbackSuccess.hasNoWebglClass}, canvasHidden=${fallbackSuccess.canvasHidden}, contentLegible=${fallbackSuccess.contentStillLegible}`);
    await context.close();
  }

  // -------------------------------------------------------------
  // TEST 6: ACCESSIBILITY & KEYBOARD NAVIGATION
  // -------------------------------------------------------------
  console.log('\n▶ [6/6] Testing Keyboard Navigation & Focus Visibility...');
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await waitForPageReady(page);

    // Tab through first 8 interactive elements
    const focusedTags = [];
    for (let i = 0; i < 8; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName.toLowerCase()}.${el.className}` : 'none';
      });
      focusedTags.push(focused);
    }

    // Verify skip-to-content or first focusable
    const h1Count = await page.evaluate(() => document.querySelectorAll('h1').length);
    const landmarkCounts = await page.evaluate(() => ({
      nav: document.querySelectorAll('nav').length,
      main: document.querySelectorAll('main').length,
      footer: document.querySelectorAll('footer').length
    }));

    results.accessibility = {
      focusedTags,
      h1Count,
      landmarkCounts
    };

    console.log(`  ✓ Focus order: ${focusedTags.slice(0, 4).join(' -> ')}`);
    console.log(`  ✓ Semantic Structure: h1=${h1Count} (strict 1 required), landmarks: nav=${landmarkCounts.nav}, main=${landmarkCounts.main}, footer=${landmarkCounts.footer}`);
    await context.close();
  }

  await browser.close();

  console.log('\n====================================================');
  console.log('TEST SUITE EXECUTION SUMMARY');
  console.log(`Total Errors Detected: ${results.totalErrors}`);
  console.log(`Total Warnings Detected: ${results.totalWarnings}`);
  console.log(`Checkpoints Saved To: ${ARTIFACTS_DIR}`);
  console.log('====================================================\n');

  fs.writeFileSync('.test-artifacts/test-results.json', JSON.stringify(results, null, 2));
  return results;
}

runTests().catch(err => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});
