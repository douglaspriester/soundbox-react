// SPL / power / delay. Free-field (anechoic) approximations.

/** Generic distance attenuation: −20·log10(d) from the 1m reference. */
export function attenAtDistance(splLevel: number, distanceM: number): number {
  const d = Math.max(distanceM, 0.1);
  return splLevel - 20 * Math.log10(d);
}

/** Watts needed to hit `target` SPL at distance, given 1W/1m sensitivity. */
export function wattsNeeded(target: number, sensitivity: number, distanceM: number): number {
  const sensAtD = attenAtDistance(sensitivity, distanceM);
  return Math.pow(10, (target - sensAtD) / 10);
}

/** Fill-speaker time alignment: distance delta (cm) → delay (ms) at 343 m/s. */
export function delayMs(deltaCm: number): number {
  return Math.max(deltaCm, 0) / 34.3;
}

/** System quality score 0–10 — single source of truth (v4 diverged between tabs). */
export function systemScore(headroom: number, splAtD: number): number {
  let score = 5;
  score += headroom > 12 ? 2 : headroom > 6 ? 1 : 0;
  if (splAtD > 97) score += 1;
  if (splAtD > 99) score += 1;
  return Math.max(0, Math.min(10, score));
}
