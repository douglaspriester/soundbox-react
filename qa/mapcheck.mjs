// Verifies the coverage model: physics laws + the realism effect of the diffuse field.
// Replicates the formulas in src/physics/coverage.ts.

const splDirect = (px, py, ems, reverbDb = -Infinity) => {
  let e = isFinite(reverbDb) ? 10 ** (reverbDb / 10) : 0;
  for (const m of ems) {
    const dx = px - m.x, dy = py - m.y;
    const d = Math.max(0.6, Math.hypot(dx, dy));
    let lvl = m.level - 20 * Math.log10(d);
    if (m.directional) {
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      const off = Math.abs(((ang - m.aimDeg + 540) % 360) - 180);
      const half = m.covDeg / 2;
      if (off > half) lvl -= (off - half) * 0.18;
    }
    if (lvl > -25) e += 10 ** (lvl / 10);
  }
  return 10 * Math.log10(e + 1e-9);
};
const reverbFloorDb = (ems, S, alpha) => {
  const a = Math.min(0.9, Math.max(0.05, alpha));
  const R = (S * a) / (1 - a);
  let e = 0;
  for (const m of ems) e += 10 ** (m.level / 10) * (4 / R);
  return 10 * Math.log10(e);
};

// ---- 1. PHYSICS LAW CHECKS ----
const one = [{ x: 0, y: 0, level: 100, directional: false, aimDeg: 0, covDeg: 360 }];
const at = (d) => splDirect(d, 0, one);
const drop2 = at(1) - at(2);   // expect 6.02
const drop10 = at(1) - at(10); // expect 20.0
const two = [{ x: 0, y: 0, level: 100, directional: false }, { x: 0, y: 0, level: 100, directional: false }];
const sumGain = splDirect(0.6, 0, two) - splDirect(0.6, 0, one); // expect +3.01
console.log('PHYSICS:');
console.log(`  inverse-square 1→2m: ${drop2.toFixed(2)}dB (esperado 6.02) ${Math.abs(drop2 - 6.02) < 0.05 ? 'OK' : 'FAIL'}`);
console.log(`  inverse-square 1→10m: ${drop10.toFixed(2)}dB (esperado 20.0) ${Math.abs(drop10 - 20) < 0.1 ? 'OK' : 'FAIL'}`);
console.log(`  2 fontes coincidentes: +${sumGain.toFixed(2)}dB (esperado +3.01) ${Math.abs(sumGain - 3.01) < 0.05 ? 'OK' : 'FAIL'}`);

// ---- 2. REALISM: audience spread direct-only vs with diffuse field ----
const L = 15, W = 4.5, H = 6;
const tx = 0.5 * L, ty = 0.92 * W;
const aim = (x, y) => (Math.atan2(ty - y, tx - x) * 180) / Math.PI;
const mk = (fx, fy, lvl, cov) => { const x = fx * L, y = fy * W; return { x, y, level: lvl, covDeg: cov, aimDeg: aim(x, y), directional: true }; };
const ems = [
  mk(0.37, 0.13, 124, 100), mk(0.63, 0.13, 124, 100),       // mains (B&C 12CL76, 400W)
  mk(0.12, 0.5, 105, 150), mk(0.88, 0.5, 105, 150), mk(0.12, 0.74, 105, 150), mk(0.88, 0.74, 105, 150), // fills
];
const S = 2 * (L * W + L * H + W * H);
const spread = (reverbDb) => {
  const v = [];
  for (let i = 0; i < 22; i++) for (let j = 0; j < 10; j++) {
    const fx = 0.05 + 0.9 * ((i + 0.5) / 22), fy = 0.42 + 0.54 * ((j + 0.5) / 10);
    v.push(splDirect(fx * L, fy * W, ems, reverbDb));
  }
  return { spread: Math.max(...v) - Math.min(...v), mean: v.reduce((a, b) => a + b) / v.length };
};
const bareA = 0.2, treatedA = (0.2 * S + 60) / S;
const direct = spread(-Infinity);
const bare = spread(reverbFloorDb(ems, S, bareA));
const treated = spread(reverbFloorDb(ems, S, treatedA));
console.log('\nREALISM (audiência, sala 15×4.5×6):');
console.log(`  superfície S=${S.toFixed(0)}m² · α nu=${bareA} (R=${(S * bareA / (1 - bareA)).toFixed(0)}) · α tratado=${treatedA.toFixed(2)}`);
console.log(`  reverb floor: nu ${reverbFloorDb(ems, S, bareA).toFixed(1)}dB · tratado ${reverbFloorDb(ems, S, treatedA).toFixed(1)}dB`);
console.log(`  spread só-direto (anecoico): ±${(direct.spread / 2).toFixed(1)}dB  ← exagera buracos`);
console.log(`  spread com reverb NU (bar vivo): ±${(bare.spread / 2).toFixed(1)}dB  ← reverb preenche, mais realista`);
console.log(`  spread com reverb TRATADO: ±${(treated.spread / 2).toFixed(1)}dB  ← estrutura do direto reaparece`);
console.log(`\n  Esperado: direto > tratado > nu (reverb nu mais uniforme). ${direct.spread > treated.spread && treated.spread > bare.spread ? 'OK — comportamento realista' : 'revisar'}`);
