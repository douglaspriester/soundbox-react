// Verifies the interactive venue: drag Main E and confirm coverage stats change.
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5173';
const MARGIN = 14, CANVAS_H = 320;

const readStats = (page) =>
  page.evaluate(() => {
    const m = {};
    document.querySelectorAll('.mt').forEach((t) => { m[t.querySelector('.ml')?.textContent] = t.querySelector('.mv')?.textContent; });
    return m;
  });

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 1100 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.setItem('soundbox:v1', JSON.stringify({ state: { activeTab: 'posicao' }, version: 1 })));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const canvas = page.locator('canvas[aria-label*="cobertura"]');
  const box = await canvas.boundingBox();
  const fx = (f) => box.x + MARGIN + f * (box.width - MARGIN * 2);
  const fy = (f) => box.y + MARGIN + f * (CANVAS_H - MARGIN * 2);

  const before = await readStats(page);

  // drag Main E (0.37,0.13) → left edge (0.10,0.12)
  await page.mouse.move(fx(0.37), fy(0.13));
  await page.mouse.down();
  for (let t = 1; t <= 6; t++) await page.mouse.move(fx(0.37 - 0.27 * (t / 6)), fy(0.125), { steps: 2 });
  await page.mouse.up();
  await page.waitForTimeout(250);

  const after = await readStats(page);

  // confirm it persisted to the store/localStorage
  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem('soundbox:v1')).state.layout?.mainL);

  await browser.close();
  console.log(JSON.stringify({ errors, before, after, changed: JSON.stringify(before) !== JSON.stringify(after), persistedMainL: persisted }, null, 2));
};

run().catch((e) => { console.error('DRAGTEST_FAILED', e); process.exit(1); });
