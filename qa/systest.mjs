// Verify: selecting each of the 3 system cards changes the coverage map (per-driver).
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:5173';

const snap = (page) =>
  page.evaluate(() => {
    const mt = {};
    document.querySelectorAll('.mt').forEach((t) => { mt[t.querySelector('.ml')?.textContent] = t.querySelector('.mv')?.textContent; });
    const driver = [...document.querySelectorAll('.equip-chip')].map((c) => c.textContent).find((t) => t.startsWith('Driver'));
    const sel = document.querySelector('.syscard.on .sysname')?.textContent;
    return { good: mt['cobertura boa'], uniform: mt['dB uniformidade'], driver, selected: sel };
  });

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 950, height: 1200 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.setItem('soundbox:v1', JSON.stringify({ state: { activeTab: 'montar' }, version: 2 })));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const out = {};
  for (const name of ['Groove Nacional', 'Soul de Papel', 'Listening Bar']) {
    await page.locator('.syscard', { hasText: name }).click();
    await page.waitForTimeout(250);
    out[name] = await snap(page);
  }
  await browser.close();
  console.log(JSON.stringify({ errors: errs, results: out }, null, 2));
};
run().catch((e) => { console.error('SYSTEST_FAILED', e); process.exit(1); });
