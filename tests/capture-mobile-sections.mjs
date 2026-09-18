import { chromium } from 'playwright';
import path from 'path';

async function captureMobileSections() {
  const browser = await chromium.launch({
    executablePath: '/home/yoge/.local/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true
  });

  await page.goto('http://localhost:8080/index.html?test=true', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#load', { state: 'hidden', timeout: 5000 });
  await page.waitForTimeout(350);

  // Capture Mobile Menu Drawer
  const burger = await page.$('#burger');
  if (burger) {
    await burger.click();
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join('.test-artifacts/screenshots', 'mobile-00-menu-open.png') });
    console.log('✓ Captured mobile-00-menu-open.png');
    // Close menu
    await burger.click();
    await page.waitForTimeout(350);
  }

  const sections = [
    { selector: '#about', name: 'mobile-01-origin.png' },
    { selector: '#research', name: 'mobile-02-discovery.png' },
    { selector: '.nums', name: 'mobile-02b-discovery-nums.png' },
    { selector: 'article[data-chapter="EXHIBIT 01"]', name: 'mobile-03-exhibit1.png' },
    { selector: '#arena', name: 'mobile-04-arena.png' },
    { selector: '#capability', name: 'mobile-05-capability.png' },
    { selector: '#path', name: 'mobile-06-path.png' },
    { selector: '#contact', name: 'mobile-07-contact.png' }
  ];

  for (const s of sections) {
    const el = await page.$(s.selector);
    if (el) {
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join('.test-artifacts/screenshots', s.name) });
      console.log('✓ Captured', s.name);
    }
  }

  await browser.close();
}

captureMobileSections().catch(err => {
  console.error(err);
  process.exit(1);
});
