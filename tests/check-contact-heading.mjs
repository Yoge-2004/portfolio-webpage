import { chromium } from 'playwright';

async function checkHeading() {
  const browser = await chromium.launch({
    executablePath: '/home/yoge/.local/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:8080/index.html?test=true');
  await page.waitForSelector('#load', { state: 'hidden' });

  const headingSelector = '#contact h2';
  const el = await page.$(headingSelector);
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const info = await page.evaluate(h => {
    const rect = h.getBoundingClientRect();
    const inners = [...h.querySelectorAll('.word-inner')].map(w => ({
      text: w.textContent,
      rect: w.getBoundingClientRect(),
      classes: w.className,
      computed: window.getComputedStyle(w).transform
    }));
    return { html: h.innerHTML, rect, inners };
  }, el);

  console.log(JSON.stringify(info, null, 2));
  await browser.close();
}

checkHeading();
