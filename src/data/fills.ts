import type { FillSpeaker } from '../types';

// 4× JBL Control One as distributed fills — spread the sound evenly through the
// long room so the back isn't starved while the front stays at 80dB. Each is
// time-aligned to the mains via DSP delay (distance ÷ 34.3 = ms).
// x/y are fractions of the venue plan (for the top-down drawing).
export interface FillUnit extends FillSpeaker {
  x: number;
  y: number;
}

export const FILLS: FillUnit[] = [
  { label: 'Control One — meio E (~5m)', distanceCm: 500, x: 0.12, y: 0.5 },
  { label: 'Control One — meio D (~5m)', distanceCm: 500, x: 0.88, y: 0.5 },
  { label: 'Control One — fundo E (~10m)', distanceCm: 1000, x: 0.12, y: 0.74 },
  { label: 'Control One — fundo D (~10m)', distanceCm: 1000, x: 0.88, y: 0.74 },
];

export const DEFAULT_FILLS: FillSpeaker[] = FILLS.map((f) => ({ label: f.label, distanceCm: f.distanceCm }));
