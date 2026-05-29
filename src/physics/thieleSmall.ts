// Thiele-Small / sealed-box math. All functions are pure and guard against
// divide-by-zero and sqrt-of-negative (a class of NaN bugs in v4).

/** Efficiency bandwidth product. EBP ~< 50 favors sealed, ~> 100 favors reflex. */
export function ebp(fs: number, qes: number): number {
  return qes > 0 ? fs / qes : 0;
}

/** Max theoretical SPL at 1m: sensitivity + 10·log10(power). */
export function maxSpl(spl: number, pw: number): number {
  return pw > 0 ? spl + 10 * Math.log10(pw) : spl;
}

/** Resulting sealed-box total Q for a given internal volume. */
export function qtc(qts: number, vas: number, vb: number): number {
  if (vb <= 0 || qts <= 0) return Infinity;
  return qts * Math.sqrt(vas / vb + 1);
}

/**
 * Internal volume (L) that yields a target Qtc.
 * Inverts Qtc = Qts·√(Vas/Vb + 1)  ⇒  Vb = Vas / ((Qtc/Qts)² − 1).
 * v4 used the rough `Vas·0.62` (which actually lands ~Qtc 0.5); this is exact.
 */
export function vbForQtc(vas: number, qts: number, targetQtc: number): number {
  if (qts <= 0) return vas;
  const r = targetQtc / qts;
  const denom = r * r - 1;
  // If the driver's free-air Q already exceeds the target, sealed alignment
  // can't reach it — fall back to a large box (low Qtc limit).
  return denom > 0 ? vas / denom : vas * 4;
}

/** In-box resonance: sealed boxes raise Fs and Q in proportion (Fc/Fs = Qtc/Qts). */
export function fc(fs: number, qtcVal: number, qts: number): number {
  return qts > 0 ? fs * (qtcVal / qts) : fs;
}

/**
 * Correct sealed −3dB frequency.
 * Solve |H|²=½ for the 2nd-order high-pass: f3 = Fc·√y,
 * y = [k + √(k²+4)]/2 with k = 1/Qtc² − 2.
 * v4 wrongly fed free-air Fs/Qts and a hardcoded 0.7071 here.
 */
export function f3Sealed(fcVal: number, qtcVal: number): number {
  if (fcVal <= 0 || qtcVal <= 0 || !isFinite(qtcVal)) return 0;
  const k = 1 / (qtcVal * qtcVal) - 2;
  const y = (k + Math.sqrt(k * k + 4)) / 2;
  return y > 0 ? fcVal * Math.sqrt(y) : 0;
}

/** Sealed-box magnitude response in dB at frequency f, relative to passband. */
export function responseDb(f: number, fcVal: number, qtcVal: number): number {
  if (fcVal <= 0 || qtcVal <= 0 || !isFinite(qtcVal)) return 0;
  const u = f / fcVal;
  const u2 = u * u;
  const denom = Math.sqrt((1 - u2) * (1 - u2) + (u / qtcVal) * (u / qtcVal));
  if (denom <= 0) return 0;
  return 20 * Math.log10(u2 / denom);
}

/** Bass-reflex tuning estimate (rough — alignment tables are exact). */
export function fbEstimate(fs: number, vas: number, vb: number): number {
  if (vb <= 0) return fs;
  return fs * Math.pow(vas / vb, 0.5) * 0.88;
}
