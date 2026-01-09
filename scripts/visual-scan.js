import { chromium } from 'playwright';
import fs from 'fs';

const url = process.env.URL || 'http://localhost:5174/track-order';
const breakpoints = [
  { name: 'mobile-375', width: 375, height: 800 },
  { name: 'mobile-412', width: 412, height: 915 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1280', width: 1280, height: 800 },
];

console.log(`Capturing ${url} in light mode at ${breakpoints.length} breakpoints...`);

await fs.promises.mkdir('screenshots', { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ colorScheme: 'light' });
const page = await context.newPage();

for (const bp of breakpoints) {
  console.log(`→ ${bp.name} (${bp.width}x${bp.height})`);
  try {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('#order-id-input', { timeout: 5000 });
    const path = `screenshots/track-order-${bp.name}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log('   saved', path);
  } catch (err) {
    console.error(`   failed for ${bp.name}:`, err.message || err);
  }
}

await browser.close();
console.log('Done. Screenshots saved to ./screenshots/');
