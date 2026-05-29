import type { AxialMode, RoomTreatments } from '../types';
import { addedSabins } from '../data/treatments';

export const SPEED_OF_SOUND = 343; // m/s @ 20°C — unified across the app

export const OCTAVE_BANDS = [63, 125, 250, 500, 1000, 2000, 4000, 8000] as const;
// Untreated-but-furnished bar (brick/concrete + bar, mezzanine, people).
// Yields ~800ms bare, matching the report's estimate. A truly empty shell
// would be lower-α / multi-second; this models the operating room.
export const UNTREATED_ALPHA = 0.2;
// Grave decays slower (longer RT60 at low bands).
const BAND_MULT = [1.5, 1.4, 1.25, 1.1, 1.0, 0.9, 0.82, 0.74] as const;

export function roomVolume(l: number, w: number, h: number): number {
  return l * w * h;
}

export function surfaceArea(l: number, w: number, h: number): number {
  return 2 * (l * w + l * h + w * h);
}

/** Sabine RT60 (seconds) for a room of average absorption `alpha`. */
export function rt60(l: number, w: number, h: number, alpha = UNTREATED_ALPHA): number {
  const s = surfaceArea(l, w, h);
  return s > 0 && alpha > 0 ? (0.161 * roomVolume(l, w, h)) / (alpha * s) : 0;
}

/** Schroeder frequency — boundary between modal and statistical behavior. */
export function schroeder(rt60Seconds: number, volume: number): number {
  return volume > 0 && rt60Seconds > 0 ? 2000 * Math.sqrt(rt60Seconds / volume) : 0;
}

/** Axial room modes for all three dimensions. */
export function axialModes(l: number, w: number, h: number, count = 5): AxialMode[] {
  const out: AxialMode[] = [];
  const push = (dim: number, axis: 'L' | 'W' | 'H') => {
    for (let n = 1; n <= count; n++) {
      out.push({ n, f: (n * SPEED_OF_SOUND) / (2 * dim), axis });
    }
  };
  push(l, 'L');
  push(w, 'W');
  push(h, 'H');
  return out;
}

function bandGroup(i: number): 'low' | 'mid' | 'high' {
  if (i <= 2) return 'low'; // 63,125,250
  if (i <= 5) return 'mid'; // 500,1k,2k
  return 'high'; // 4k,8k
}

/** Per-octave-band RT60 (seconds), bare and treated, plus scalar treated avg. */
export function rt60Bands(
  l: number,
  w: number,
  h: number,
  treatments: RoomTreatments,
): { bare: number[]; treated: number[]; treatedAvg: number } {
  const v = roomVolume(l, w, h);
  const base = rt60(l, w, h, UNTREATED_ALPHA);
  const added = addedSabins(treatments);
  const bare: number[] = [];
  const treated: number[] = [];
  for (let i = 0; i < OCTAVE_BANDS.length; i++) {
    const bareBand = base * BAND_MULT[i];
    bare.push(bareBand);
    const bareSabin = bareBand > 0 ? (0.161 * v) / bareBand : 0;
    const add = added[bandGroup(i)];
    treated.push(bareSabin + add > 0 ? (0.161 * v) / (bareSabin + add) : bareBand);
  }
  const treatedAvg = treated.reduce((a, b) => a + b, 0) / treated.length;
  return { bare, treated, treatedAvg };
}
