import type { Config, Derived } from '../types';
import * as ts from './thieleSmall';
import * as ac from './acoustics';
import * as splMod from './spl';
import { cabinetDims } from './cabinet';

/** Compute every derived value from a Config. Pure; memoize at the call site. */
export function derive(c: Config): Derived {
  const volume = ac.roomVolume(c.length, c.width, c.height);
  const surface = ac.surfaceArea(c.length, c.width, c.height);
  const rt60 = ac.rt60(c.length, c.width, c.height);
  const bands = ac.rt60Bands(c.length, c.width, c.height, c.treatments);
  const anyTreatment = Object.values(c.treatments).some(Boolean);
  const rt60Operational = anyTreatment ? bands.treatedAvg : rt60;
  const schroeder = ac.schroeder(rt60Operational, volume);
  const modes = ac.axialModes(c.length, c.width, c.height, 5);

  const w = c.woofer;
  const ebp = ts.ebp(w.fs, w.qes);
  const wooferMaxSpl = ts.maxSpl(w.spl, w.pw);
  const driverMaxSpl = ts.maxSpl(c.driver.spl, c.driver.pw);
  const hfSafe = c.driver.xo >= c.driver.fmin;

  const vbSuggested = ts.vbForQtc(w.vas, w.qts, c.targetQtc);
  const vb = c.useCustomVolume ? c.volumeL : vbSuggested;
  const qtc = ts.qtc(w.qts, w.vas, vb);
  const fc = ts.fc(w.fs, qtc, w.qts);
  const f3 = ts.f3Sealed(fc, qtc);
  const dims = cabinetDims(vb);

  const splAtDistance = splMod.attenAtDistance(wooferMaxSpl, c.distance);
  const headroom = splAtDistance - c.splTarget;
  const wattsNeeded = splMod.wattsNeeded(c.splTarget, w.spl, c.distance);
  const score = splMod.systemScore(headroom, splAtDistance);

  return {
    volume, surface, rt60, rt60Treated: bands.treatedAvg, rt60ms: rt60Operational * 1000,
    schroeder, modes,
    ebp, wooferMaxSpl, driverMaxSpl, hfSafe,
    vbSuggested, vb, qtc, fc, f3, dims,
    splAtDistance, headroom, wattsNeeded, score,
  };
}
