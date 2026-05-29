// Verifies the upgraded coverage map: move, rotate, add speaker, persistence, real-spec coupling.
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:5173';
const M = 14;

const state = (page) =>
  page.evaluate(() => {
    const mt = {};
    document.querySelectorAll('.mt').forEach((t) => { mt[t.querySelector('.ml')?.textContent] = t.querySelector('.mv')?.textContent; });
    const ls = JSON.parse(localStorage.getItem('soundbox:v1') || '{}');
    return { good: mt['cobertura boa'], uniform: mt['dB uniformidade'], speakers: ls.state?.layout?.speakers || [] };
  });

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 900, height: 1200 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.setItem('soundbox:v1', JSON.stringify({ state: { activeTab: 'posicao' }, version: 2 })));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  const canvas = page.locator('canvas[aria-label*="cobertura"]');
  const box = await canvas.boundingBox();
  const FX = (f) => box.x + M + f * (box.width - 2 * M);
  const FY = (f) => box.y + M + f * (box.height - 2 * M);
  const W = 12, H = 4.5;

  const r0 = await state(page);

  // A) MOVE main-1 body (0.37,0.13) → (0.15,0.12)
  await page.mouse.move(FX(0.37), FY(0.13));
  await page.mouse.down();
  await page.mouse.move(FX(0.15), FY(0.12), { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  const r1 = await state(page);

  // B) ROTATE main-2 via its aim tip (body 0.63,0.13, aim 114°)
  const aim = (114 * Math.PI) / 180;
  const tipFx = (0.63 * W + Math.cos(aim) * 1.4) / W;
  const tipFy = (0.13 * H + Math.sin(aim) * 1.4) / H;
  await page.mouse.move(FX(tipFx), FY(tipFy));
  await page.mouse.down();
  await page.mouse.move(FX(0.63), FY(0.55), { steps: 8 }); // point it straight down
  await page.mouse.up();
  await page.waitForTimeout(200);
  const r2 = await state(page);

  // C) ADD a main
  await page.locator('button:has-text("+ main")').click();
  await page.waitForTimeout(200);
  const r3 = await state(page);

  const main2Before = r0.speakers.find((s) => s.id === 'main-2');
  const main2After = r2.speakers.find((s) => s.id === 'main-2');

  await browser.close();
  console.log(JSON.stringify({
    errors,
    initialSpeakers: r0.speakers.length,
    move: { before: r0.good, after: r1.good, changed: r0.good !== r1.good },
    rotate: { aimBefore: main2Before?.aimDeg?.toFixed?.(1), aimAfter: main2After?.aimDeg?.toFixed?.(1), changed: main2Before?.aimDeg !== main2After?.aimDeg },
    add: { countBefore: r2.speakers.length, countAfter: r3.speakers.length },
  }, null, 2));
};

run().catch((e) => { console.error('MAPTEST_FAILED', e); process.exit(1); });
