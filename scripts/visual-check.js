import { chromium } from 'playwright';

const url = process.env.URL || 'http://127.0.0.1:5173/track-order';
const breakpoints = [
  { name: 'mobile-375', width: 375, height: 800 },
  { name: 'mobile-412', width: 412, height: 915 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1280', width: 1280, height: 800 },
];

function rgbStrToArray(s) {
  const m = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function luminance([r, g, b]) {
  const srgb = [r, g, b].map(v => v / 255).map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
  return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
}

function contrastRatio(l1, l2) {
  const a = Math.max(l1, l2);
  const b = Math.min(l1, l2);
  return (a + 0.05) / (b + 0.05);
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ colorScheme: 'light' });
  const page = await context.newPage();

  const results = [];
  for (const bp of breakpoints) {
    await page.setViewportSize({ width: bp.width, height: bp.height });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('#order-id-input', { timeout: 8000 });

    const res = { bp: bp.name, issues: [] };

    // Horizontal scroll
    const hasH = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    if (hasH) res.issues.push('horizontal-scroll');

    // Input icon overlap (order id input) — more precise check using padding-right
    const overlap = await page.evaluate(() => {
      const input = document.querySelector('#order-id-input');
      if (!input) return false;
      const svg = input.parentElement.querySelector('svg');
      if (!svg) return false;
      const ib = input.getBoundingClientRect();
      const sb = svg.getBoundingClientRect();
      const cs = window.getComputedStyle(input);
      const pr = parseFloat(cs.paddingRight) || 0;
      const inputContentRight = ib.right - pr;
      // If the icon's left is inside the content area, it's overlapping
      return sb.left < inputContentRight;
    });
    if (overlap) res.issues.push('input-icon-overlap');

    // Product names overflow
    const overflowItems = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('[data-testid="order-item-name"]'));
      return els.map(el => ({ text: el.textContent?.trim().slice(0,100), overflow: el.scrollWidth > el.clientWidth }));
    });
    if (overflowItems.some(i => i.overflow)) res.issues.push('product-name-overflow');

    // Contrast check for order summary card
    const contrastFail = await page.evaluate(() => {
      const card = document.querySelector('div[aria-hidden]') || document.querySelector('.bg-emerald-50');
      // try selector fallback
      const target = document.querySelector('.bg-emerald-50') || document.querySelector('.rounded-3xl');
      if (!target) return false;
      const style = window.getComputedStyle(target);
      const bg = style.backgroundColor;
      const text = (target.querySelector('h3') && window.getComputedStyle(target.querySelector('h3')).color) || window.getComputedStyle(target).color;
      return { bg, text };
    });

    if (contrastFail && contrastFail.bg && contrastFail.text) {
      const bgRgb = rgbStrToArray(contrastFail.bg);
      const txtRgb = rgbStrToArray(contrastFail.text);
      if (bgRgb && txtRgb) {
        const cr = contrastRatio(luminance(bgRgb), luminance(txtRgb));
        if (cr < 3.0) res.issues.push(`low-contrast (ratio=${cr.toFixed(2)})`);
      }
    }

    results.push(res);
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})();
