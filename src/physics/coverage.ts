// Simplified broadband coverage model: each emitter contributes
// level − 20·log10(distance) − off-axis rolloff. Energy-summed across emitters.
// Good enough to show "where the sound lands" and how even it is as speakers move.

export interface Emitter {
  x: number; // meters
  y: number; // meters
  aimDeg: number; // pointing direction (screen convention: +x right, +y down)
  covDeg: number; // -6dB coverage angle
  level: number; // on-axis reference level (dB)
  directional: boolean;
}

/**
 * Diffuse (reverberant) field level for the room — classic direct+reverberant
 * model: SPL_rev ≈ Lw + 10·log10(4/R), R = Sα/(1−α). In a live room this floor
 * fills the holes between speakers; treating the room (higher α) lowers it and
 * lets the direct-field structure show. Energy-summed over all sources.
 */
export function reverbFloorDb(ems: Emitter[], surfaceArea: number, alpha: number): number {
  const a = Math.min(0.9, Math.max(0.05, alpha));
  const R = (surfaceArea * a) / (1 - a);
  if (R <= 0 || ems.length === 0) return -Infinity;
  let e = 0;
  for (const em of ems) e += Math.pow(10, em.level / 10) * (4 / R);
  return e > 0 ? 10 * Math.log10(e) : -Infinity;
}

/** Total SPL at a point: direct field from each source + the room's diffuse floor. */
export function splAtPoint(px: number, py: number, ems: Emitter[], reverbDb = -Infinity): number {
  let energy = isFinite(reverbDb) ? Math.pow(10, reverbDb / 10) : 0;
  for (const e of ems) {
    const dx = px - e.x;
    const dy = py - e.y;
    const dist = Math.max(0.6, Math.hypot(dx, dy));
    let lvl = e.level - 20 * Math.log10(dist);
    if (e.directional) {
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      const off = Math.abs(((ang - e.aimDeg + 540) % 360) - 180); // 0..180°
      const half = e.covDeg / 2;
      if (off > half) lvl -= (off - half) * 0.18; // dB per degree beyond coverage
    }
    if (lvl > -25) energy += Math.pow(10, lvl / 10);
  }
  return 10 * Math.log10(energy + 1e-9);
}

export interface CoverageZone {
  x0: number; y0: number; x1: number; y1: number; // fractions of the room
}

export interface CoverageStats {
  mean: number;
  spread: number; // max − min (dB) — lower = more uniform
  goodPct: number; // % of audience within ±3dB of mean
}

export function coverageStats(ems: Emitter[], roomW: number, roomH: number, zone: CoverageZone, reverbDb = -Infinity): CoverageStats {
  const vals: number[] = [];
  const cols = 22, rows = 10;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const fx = zone.x0 + (zone.x1 - zone.x0) * ((i + 0.5) / cols);
      const fy = zone.y0 + (zone.y1 - zone.y0) * ((j + 0.5) / rows);
      vals.push(splAtPoint(fx * roomW, fy * roomH, ems, reverbDb));
    }
  }
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const good = vals.filter((v) => Math.abs(v - mean) <= 3).length / vals.length;
  return { mean, spread: max - min, goodPct: good * 100 };
}
