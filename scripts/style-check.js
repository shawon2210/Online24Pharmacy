import { chromium } from 'playwright';

const url = process.env.URL || 'http://127.0.0.1:5173/track-order';

function parseRgb(s){
  const m = s && s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if(!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function luminance([r,g,b]){
  const srgb = [r,g,b].map(v=>v/255).map(v=> v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4));
  return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
}

function contrast(a,b){
  const A = Math.max(a,b); const B = Math.min(a,b);
  return (A+0.05)/(B+0.05);
}

(async()=>{
  const browser = await chromium.launch();
  const context = await browser.newContext({ colorScheme: 'light' });
  const page = await context.newPage();
  await page.addInitScript(() => {
    try {
      localStorage.setItem('theme', 'light');
      document.documentElement.classList.remove('dark');
    } catch (e) {}
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  // Force theme after load as well in case app re-evaluates
  await page.evaluate(() => {
    try {
      localStorage.setItem('theme', 'light');
      const root = document.documentElement;
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
      // debug: expose actual stored theme
      window.__debug_theme = { stored: localStorage.getItem('theme'), classList: root.className };
    } catch (e) {}
  });

  // Read debug state back into Node process
  const themeDebug = await page.evaluate(() => ({ stored: localStorage.getItem('theme'), classes: document.documentElement.className }));
  console.log('Theme debug:', themeDebug);


  const checks = await page.evaluate(()=>{
    const query = s => document.querySelector(s);
    const header = query('header') || query('.sticky');
    const submit = document.querySelector('form button[type="submit"]');
    const input = document.querySelector('#order-id-input');
    const orderSummary = document.querySelector('.bg-emerald-50') || document.querySelector('.rounded-3xl');

    const els = { header, submit, input, orderSummary };
    const result = {};
    for(const [k, el] of Object.entries(els)){
      if(!el) { result[k] = null; continue; }
      const cs = window.getComputedStyle(el);
      result[k] = { bg: cs.backgroundColor, color: cs.color, fontSize: cs.fontSize, className: el.className };
    }
    // timeline cards
    const timelineCards = Array.from(document.querySelectorAll('.bg-card')).slice(0,5).map(el=>({ className: el.className, bg: window.getComputedStyle(el).backgroundColor, color: window.getComputedStyle(el).color }));
    result.timelineCards = timelineCards;
    return result;
  });

  const report = [];
  for(const [k,v] of Object.entries(checks)){
    if(!v) continue;
    const bg = parseRgb(v.bg) || [255,255,255];
    const fg = parseRgb(v.color) || [0,0,0];
    const cr = contrast(luminance(bg), luminance(fg));
    report.push({ el: k, className: v.className, bg: v.bg, color: v.color, contrast: Number(cr.toFixed(2)), fontSize: v.fontSize });
  }

  // timeline cards
  if(checks.timelineCards) for(const c of checks.timelineCards){
    const bg = parseRgb(c.bg) || [255,255,255];
    const fg = parseRgb(c.color) || [0,0,0];
    const cr = contrast(luminance(bg), luminance(fg));
    report.push({ el: 'timelineCard', className: c.className, bg: c.bg, color: c.color, contrast: Number(cr.toFixed(2)) });
  }

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})();
