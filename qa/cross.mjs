// Cross-cutting QA for SoundBox: persistence, share-URL roundtrip, nav/ARIA, responsive.
// Usage: node qa/cross.mjs [--headed]
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'out');
mkdirSync(OUT, { recursive: true });

const BASE = process.env.BASE || 'http://localhost:5173';
const STORE_KEY = 'soundbox:v1';
const HASH_PREFIX = '#c=';
const headed = process.argv.includes('--headed');

const ALL_TABS = ['resumo', 'sala', 'woofer', 'driver', 'sub', 'gabinete', 'sistema', 'dsp', 'posicao', 'montagem', 'orca', 'comparar'];

// Scope to the PRIMARY top-level nav (the 12-tab tablist with #tab-* ids).
// Nested SubTabs also use role=tab inside their own tablist, so a global query is ambiguous.
const sel = (page) => page.evaluate(() => {
  const mainNav = document.querySelector('.nav[role=tablist]');
  const tabs = mainNav ? [...mainNav.querySelectorAll('[role=tab]')] : [];
  const allTabs = [...document.querySelectorAll('[role=tab]')];
  return {
    count: tabs.length,
    selected: tabs.filter((t) => t.getAttribute('aria-selected') === 'true').map((t) => t.id),
    activeText: tabs.find((t) => t.getAttribute('aria-selected') === 'true')?.textContent ?? null,
    panelId: document.querySelector('main [role=tabpanel]')?.id ?? null,
    globalTabCount: allTabs.length,
    globalSelectedCount: allTabs.filter((t) => t.getAttribute('aria-selected') === 'true').length,
  };
});

const run = async () => {
  const browser = await chromium.launch({ headless: !headed });
  const report = { base: BASE, checks: {}, bugs: [], detail: {} };

  // ---- Shared error sink helper ----
  const wireLogs = (page, bucket) => {
    page.on('console', (m) => { if (m.type() === 'error') bucket.push({ scope: 'console', text: m.text().slice(0, 300) }); });
    page.on('pageerror', (e) => bucket.push({ scope: 'pageerror', text: String(e).slice(0, 300) }));
  };

  // =====================================================================
  // 1. PERSISTENCE — click a tab, reload, confirm aria-selected survives.
  // =====================================================================
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const errs = [];
    wireLogs(page, errs);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    // start clean so we can prove the change persists, not a leftover
    await page.evaluate((k) => localStorage.removeItem(k), STORE_KEY);
    await page.reload({ waitUntil: 'networkidle' });

    const before = await sel(page);
    // Click the 'Gabinete' tab via UI (real interaction path).
    await page.locator('[role=tab]#tab-gabinete').click();
    await page.waitForTimeout(150);
    const afterClick = await sel(page);
    const storedAfterClick = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}'), STORE_KEY);

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(250);
    const afterReload = await sel(page);

    const pass = before.activeText !== 'Gabinete'
      && afterClick.activeText === 'Gabinete'
      && afterReload.activeText === 'Gabinete'
      && afterReload.panelId === 'panel-gabinete'
      && storedAfterClick?.state?.activeTab === 'gabinete';
    report.checks.persistence = pass ? 'PASS' : 'FAIL';
    report.detail.persistence = { before: before.activeText, afterClick: afterClick.activeText, afterReload: afterReload.activeText, storedActiveTab: storedAfterClick?.state?.activeTab, panelId: afterReload.panelId, errors: errs };
    if (!pass) report.bugs.push({ title: 'activeTab does not persist across reload', severity: 'high', detail: report.detail.persistence });
    await ctx.close();
  }

  // =====================================================================
  // 2. SHARE URL — click compartilhar, read hash, open fresh page at URL.
  // =====================================================================
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    const errs = [];
    wireLogs(page, errs);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate((k) => localStorage.removeItem(k), STORE_KEY);
    await page.reload({ waitUntil: 'networkidle' });

    // Mutate a distinctive, serialisable config value so the roundtrip is observable.
    // Length slider is step=0.5 (min 6, max 20); pick a valid value != default 12.
    const SENTINEL = 9.5;

    // Drive the Sala tab's length input so the value is real user state.
    await page.locator('[role=tab]#tab-sala').click();
    await page.waitForTimeout(120);
    // Find a number input near "Comprimento" (length). Fall back to first range/number input.
    const lengthSet = await page.evaluate((len) => {
      const labels = [...document.querySelectorAll('label, .sk, .control, *')];
      // Heuristic: find an <input type=number|range> whose surrounding text mentions comprimento/length.
      const inputs = [...document.querySelectorAll('input[type=number], input[type=range]')];
      for (const inp of inputs) {
        const ctxTxt = (inp.closest('div')?.textContent || '').toLowerCase();
        if (ctxTxt.includes('comprimento') || ctxTxt.includes('comp.') || ctxTxt.includes('length')) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(inp, String(len));
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          return { ok: true, kind: inp.type, val: inp.value };
        }
      }
      return { ok: false, count: inputs.length };
    }, SENTINEL);
    await page.waitForTimeout(150);
    const storedLen = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}')?.state?.length, STORE_KEY);

    // Click share.
    await page.locator('button:has-text("compartilhar")').click();
    await page.waitForTimeout(250);
    const hash = await page.evaluate(() => location.hash);
    const btnText = await page.locator('.hdr-actions button').first().textContent();
    const hashWritten = hash.startsWith(HASH_PREFIX) && hash.length > HASH_PREFIX.length + 2;

    // Open a NEW context at the full shared URL.
    const fullUrl = await page.evaluate(() => location.origin + location.pathname + location.hash);
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page2 = await ctx2.newPage();
    const errs2 = [];
    wireLogs(page2, errs2);
    await page2.goto(fullUrl, { waitUntil: 'networkidle' });
    await page2.waitForTimeout(250);
    const loaded2 = await sel(page2);
    const loadedLen = await page2.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{}')?.state?.length, STORE_KEY);
    const crashed2 = errs2.length > 0 || loaded2.count !== 12;

    // Roundtrip is correct if the fresh page loaded the SAME length that was stored
    // pre-share, AND that value differs from the default (12) — proving the hash carried it.
    const roundtripValueOk = lengthSet.ok
      ? (Math.abs((loadedLen ?? -999) - (storedLen ?? -1000)) < 0.01 && Math.abs((loadedLen ?? 12) - 12) > 0.01)
      : null;
    const pass = hashWritten && !crashed2 && loaded2.count === 12 && (roundtripValueOk === null ? true : roundtripValueOk);
    report.checks.shareUrl = pass ? 'PASS' : 'FAIL';
    report.detail.shareUrl = {
      hashWritten, hashSample: hash.slice(0, 40) + '...', btnTextAfterClick: btnText,
      sentinelLength: SENTINEL, lengthSet, storedLenAfterEdit: storedLen,
      freshPageLoadedLength: loadedLen, roundtripValueOk,
      freshPageTabCount: loaded2.count, freshPageErrors: errs2, sourceErrors: errs,
    };
    if (!hashWritten) report.bugs.push({ title: 'compartilhar does not write #c= hash', severity: 'high', detail: report.detail.shareUrl });
    if (crashed2) report.bugs.push({ title: 'shared URL crashes or fails to mount 12 tabs', severity: 'high', detail: { errs2, count: loaded2.count } });
    if (roundtripValueOk === false) report.bugs.push({ title: 'shared config value not honored on fresh load', severity: 'high', detail: { expected: SENTINEL, got: loadedLen } });
    await ctx.close();
    await ctx2.close();
  }

  // =====================================================================
  // 3. NAV / ARIA — 12 tabs, exactly one selected, each switches no error.
  // =====================================================================
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    const errs = [];
    wireLogs(page, errs);
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.evaluate((k) => localStorage.removeItem(k), STORE_KEY);
    await page.reload({ waitUntil: 'networkidle' });
    // Wait for React to hydrate the tablist before snapshotting baseline ARIA state.
    await page.waitForSelector('[role=tab][aria-selected=true]', { timeout: 5000 });

    const init = await sel(page);
    const tabsAre12 = init.count === 12;
    const switchResults = [];
    let exactlyOneAlways = init.selected.length === 1;
    const initSelected = init.selected.slice();
    const globalMultiSelectTabs = []; // panels where >1 role=tab is selected document-wide

    for (const id of ALL_TABS) {
      const before = errs.length;
      let clickOk = true, s = null;
      try {
        await page.locator(`[role=tab]#tab-${id}`).click({ timeout: 3000 });
        await page.waitForTimeout(120);
        s = await sel(page);
      } catch (e) {
        clickOk = false;
      }
      const selectedOne = s ? s.selected.length === 1 : false;
      const correctTab = s ? s.selected[0] === `tab-${id}` : false;
      const panelOk = s ? s.panelId === `panel-${id}` : false;
      const newErrs = errs.slice(before);
      if (!selectedOne) exactlyOneAlways = false;
      if (s && s.globalSelectedCount > 1) globalMultiSelectTabs.push({ id, globalSelectedCount: s.globalSelectedCount, globalTabCount: s.globalTabCount });
      switchResults.push({ id, clickOk, correctTab, selectedOne, panelOk, errs: newErrs });
    }

    const allSwitched = switchResults.every((r) => r.clickOk && r.correctTab && r.panelOk && r.errs.length === 0);
    const pass = tabsAre12 && exactlyOneAlways && allSwitched && errs.length === 0;
    report.checks.tabsSwitchNoError = pass ? 'PASS' : 'FAIL';
    report.detail.nav = { tabCount: init.count, tabsAre12, exactlyOneAlways, initSelected, globalMultiSelectTabs, failures: switchResults.filter((r) => !(r.clickOk && r.correctTab && r.panelOk && r.errs.length === 0)), totalConsoleErrors: errs.length, allErrors: errs };
    if (!tabsAre12) report.bugs.push({ title: `expected 12 tabs, found ${init.count}`, severity: 'high' });
    if (!exactlyOneAlways) report.bugs.push({ title: 'main nav: not exactly one aria-selected tab at all times', severity: 'medium', detail: { initSelected, failures: report.detail.nav.failures } });
    if (!allSwitched) report.bugs.push({ title: 'one or more tabs failed to switch cleanly', severity: 'high', detail: report.detail.nav.failures });
    if (globalMultiSelectTabs.length) report.bugs.push({ title: 'nested SubTabs share role=tab globally -> >1 aria-selected document-wide on some panels', severity: 'low', detail: globalMultiSelectTabs });
    await ctx.close();
  }

  // =====================================================================
  // 4. RESPONSIVE — mobile 390x800 + desktop 1280x900, overflow check.
  // =====================================================================
  {
    // Mobile
    const ctxM = await browser.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
    const pageM = await ctxM.newPage();
    const errsM = [];
    wireLogs(pageM, errsM);
    await pageM.goto(BASE, { waitUntil: 'networkidle' });
    await pageM.waitForTimeout(400);
    await pageM.screenshot({ path: join(OUT, 'mobile.png'), fullPage: true });
    const mMetrics = await pageM.evaluate(() => ({
      vw: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    const TOL = 2;
    const mobileOverflow = Math.max(mMetrics.scrollWidth, mMetrics.bodyScrollWidth) - mMetrics.vw;
    const mobileNoOverflow = mobileOverflow <= TOL;
    await ctxM.close();

    // Desktop
    const ctxD = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
    const pageD = await ctxD.newPage();
    const errsD = [];
    wireLogs(pageD, errsD);
    await pageD.goto(BASE, { waitUntil: 'networkidle' });
    await pageD.waitForTimeout(400);
    await pageD.screenshot({ path: join(OUT, 'desktop.png'), fullPage: true });
    const dMetrics = await pageD.evaluate(() => ({ vw: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    const desktopOverflow = dMetrics.scrollWidth - dMetrics.vw;
    await ctxD.close();

    report.checks.mobileNoOverflow = mobileNoOverflow ? 'PASS' : 'FAIL';
    report.detail.responsive = { mobile: { ...mMetrics, overflowPx: mobileOverflow, errors: errsM }, desktop: { ...dMetrics, overflowPx: desktopOverflow, errors: errsD } };
    if (!mobileNoOverflow) report.bugs.push({ title: `horizontal overflow on mobile (+${mobileOverflow}px past ${mMetrics.vw}px)`, severity: 'medium', detail: report.detail.responsive.mobile });
  }

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
  const allPass = Object.values(report.checks).every((v) => v === 'PASS');
  process.exitCode = allPass ? 0 : 1;
};

run().catch((e) => { console.error('CROSS_FAILED', e); process.exit(2); });
