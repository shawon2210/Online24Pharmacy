import { chromium } from 'playwright';

const url = process.env.URL || 'http://127.0.0.1:5173/track-order';

(async ()=>{
  const browser = await chromium.launch();
  const context = await browser.newContext({ colorScheme: 'light' });
  const page = await context.newPage();
  await page.addInitScript(()=>{
    try{ localStorage.setItem('theme','light'); document.documentElement.classList.remove('dark'); document.documentElement.classList.add('light'); }catch(e){}
  });
  await page.goto(url, { waitUntil: 'networkidle' });

  // ensure starting in light
  const startClass = await page.evaluate(()=>document.documentElement.className);
  console.log('start class:', startClass);

  // find the ThemeToggle button
  const toggle = await page.$('button[aria-label^="Switch to"]');
  if(!toggle) { console.error('Theme toggle not found'); await browser.close(); process.exit(2); }

  // click to cycle theme: light -> dark
  await toggle.click();
  await page.waitForTimeout(300);
  const afterClass = await page.evaluate(()=>document.documentElement.className);
  console.log('after click class:', afterClass);

  // check computed background of body
  const bodyBg = await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--background'));
  console.log('CSS --background:', bodyBg.trim());

  // click again to go to system (or light depending on cycle)
  await toggle.click();
  await page.waitForTimeout(300);
  const after2Class = await page.evaluate(()=>document.documentElement.className);
  console.log('after 2 clicks class:', after2Class);

  // Simulate cross-tab storage update: open a second page and dispatch a storage event
  const page2 = await context.newPage();
  await page2.goto(url, { waitUntil: 'networkidle' });
  // ensure page1 currently has a class
  const beforeDispatch = await page.evaluate(()=>document.documentElement.className);
  console.log('before storage dispatch (page1):', beforeDispatch);
  // dispatch storage event on page2 to set theme=dark
  await page2.evaluate(()=>{
    try{ localStorage.setItem('theme','dark'); }catch(e){}
    window.dispatchEvent(new StorageEvent('storage', {key:'theme', newValue:'dark'}));
  });
  await page.waitForTimeout(300);
  const afterStorageClass = await page.evaluate(()=>document.documentElement.className);
  console.log('after storage dispatch (page1):', afterStorageClass);

  await browser.close();
})();