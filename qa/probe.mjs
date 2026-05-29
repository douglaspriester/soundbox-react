// Headless (or headed) QA probe for SoundBox.
// Usage: node qa/probe.mjs <tabId|all> [--headed] [--treat] [--share] [--saveB]
// Loads a tab, captures console errors/warnings + page errors, verifies every
// canvas actually painted (pixel variance vs the #0a0a0a background), reads
// metrics/alerts/rows, and writes a full-page screenshot to qa/out/<tab>.png.

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'out');
mkdirSync(OUT, { recursive: true });

const BASE = process.env.BASE || 'http://localhost:5173';
const ALL_TABS = ['resumo', 'sala', 'woofer', 'driver', 'sub', 'gabinete', 'sistema', 'dsp', 'posicao', 'montagem', 'orca', 'comparar'];

const arg = process.argv[2] || 'all';
const headed = process.argv.includes('--headed');
const treat = process.argv.includes('--treat');
const doShare = process.argv.includes('--share');
const saveB = process.argv.includes('--saveB');
const tabs = arg === 'all' ? ALL_TABS : [arg];

const CANVAS_CHECK = () => {
  const out = [];
  document.querySelectorAll('canvas').forEach((cv, i) => {
    let painted = false, nonBg = 0, total = 0;
    try {
      const ctx = cv.getContext('2d');
      const w = cv.width, h = cv.height;
      const data = ctx.getImageData(0, 0, w, h).data;
      const step = Math.max(4, Math.floor((w * h) / 6000)) * 4;
      for (let p = 0; p < data.length; p += step) {
        total++;
        const r = data[p], g = data[p + 1], b = data[p + 2];
        if (Math.abs(r - 10) > 6 || Math.abs(g - 10) > 6 || Math.abs(b - 10) > 6) nonBg++;
      }
      painted = total > 0 && nonBg > total * 0.004;
    } catch (e) { /* tainted/zero */ }
    out.push({ i, label: cv.getAttribute('aria-label')?.slice(0, 44) || null, w: cv.width, h: cv.height, painted, ratio: total ? +(nonBg / total).toFixed(3) : 0 });
  });
  return out;
};

const READ = () => {
  const metrics = {};
  document.querySelectorAll('.mt').forEach((m) => { metrics[m.querySelector('.ml')?.textContent || '?'] = m.querySelector('.mv')?.textContent; });
  const alerts = [...document.querySelectorAll('.al')].map((a) => ({ sev: [...a.classList].find((c) => c !== 'al'), title: a.querySelector('.at')?.textContent }));
  const rows = {};
  document.querySelectorAll('.sr').forEach((s) => { const k = s.querySelector('.sk')?.textContent; if (k) rows[k] = s.querySelector('.sv')?.textContent; });
  const active = document.querySelector('[role=tab][aria-selected=true]')?.textContent;
  return { active, metrics, alerts, rows };
};

const run = async () => {
  const browser = await chromium.launch({ headless: !headed });
  const ctx = await browser.newContext({ viewport: { width: 920, height: 1500 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') logs.push({ t: msg.type(), text: msg.text().slice(0, 300) }); });
  page.on('pageerror', (err) => logs.push({ t: 'pageerror', text: String(err).slice(0, 300) }));

  const report = { base: BASE, headed, results: [] };

  await page.goto(BASE, { waitUntil: 'networkidle' });

  for (const tab of tabs) {
    const tabLogs0 = logs.length;
    await page.evaluate(({ tab, treat }) => {
      const k = 'soundbox:v1';
      const o = { state: {}, version: 1 };
      o.state.activeTab = tab;
      if (treat) o.state.treatments = { bassTraps: true, panels: true, ceiling: true, diffuser: true };
      localStorage.setItem(k, JSON.stringify(o));
    }, { tab, treat });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(450); // let rAF paints settle

    if (saveB) { await page.locator('button:has-text("Salvar config atual como B")').click().catch(() => {}); await page.waitForTimeout(200); }
    if (doShare && tab === 'resumo') { await page.locator('button:has-text("compartilhar")').click().catch(() => {}); await page.waitForTimeout(200); }

    const canvases = await page.evaluate(CANVAS_CHECK);
    const read = await page.evaluate(READ);
    await page.screenshot({ path: join(OUT, `${tab}.png`), fullPage: true });
    const tabLogs = logs.slice(tabLogs0);
    report.results.push({ tab, active: read.active, metrics: read.metrics, alerts: read.alerts, rows: read.rows, canvases, logs: tabLogs });
  }

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
};

run().catch((e) => { console.error('PROBE_FAILED', e); process.exit(1); });
