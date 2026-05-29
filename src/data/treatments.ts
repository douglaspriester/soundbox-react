import type { RoomTreatments } from '../types';

// Acoustic treatment items (report §7). Each contributes Sabine absorption
// (m²·α, "sabins") split across low / mid / high band groups. Values are
// engineering estimates for the DIY treatment described in the report.
export interface TreatmentItem {
  key: keyof RoomTreatments;
  label: string;
  cost: string;
  low: number;
  mid: number;
  high: number;
}

export const TREATMENTS: TreatmentItem[] = [
  { key: 'bassTraps', label: 'Bass traps 200mm — 4 cantos, piso ao teto', cost: 'R$ 600–800 DIY', low: 30, mid: 22, high: 16 },
  { key: 'panels', label: 'Painéis absorventes 100mm — 6–8 un', cost: 'R$ 800–1.200', low: 4, mid: 22, high: 24 },
  { key: 'ceiling', label: 'Painel suspenso no teto entre mains e público', cost: 'R$ 400', low: 2, mid: 10, high: 10 },
  { key: 'diffuser', label: 'Difusor madeira ripada no fundo da sala', cost: 'R$ 400', low: 1, mid: 6, high: 6 },
];

/** Total added sabins per band group from the active treatments. */
export function addedSabins(t: RoomTreatments): { low: number; mid: number; high: number } {
  let low = 0, mid = 0, high = 0;
  for (const item of TREATMENTS) {
    if (t[item.key]) {
      low += item.low;
      mid += item.mid;
      high += item.high;
    }
  }
  return { low, mid, high };
}
