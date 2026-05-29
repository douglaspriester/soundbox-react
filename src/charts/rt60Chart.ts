import type { CanvasSize } from './types';
import { TOKENS } from '../theme/tokens';
import { OCTAVE_BANDS } from '../physics/acoustics';

export interface Rt60Params {
  bare: number[]; // seconds per band
  treated: number[]; // seconds per band
  targetMs: number;
  showTreated: boolean;
}

export function drawRt60Chart(ctx: CanvasRenderingContext2D, size: CanvasSize, p: Rt60Params): void {
  const padL = 30, padR = 10, padT = 12, padB = 22;
  const x0 = padL, x1 = size.width - padR, y0 = padT, y1 = size.height - padB;
  const maxMs = Math.max(p.targetMs * 1.5, ...p.bare.map((s) => s * 1000)) * 1.05;
  const yOf = (ms: number) => y1 - (Math.min(ms, maxMs) / maxMs) * (y1 - y0);

  // y labels
  ctx.font = '9px system-ui';
  ctx.fillStyle = TOKENS.text4;
  ctx.textAlign = 'right';
  for (let ms = 0; ms <= maxMs; ms += maxMs <= 1500 ? 300 : 600) {
    const y = yOf(ms);
    ctx.strokeStyle = TOKENS.grid;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    ctx.fillText(`${ms.toFixed(0)}`, x0 - 3, y + 3);
  }

  const n = OCTAVE_BANDS.length;
  const slot = (x1 - x0) / n;
  const bw = slot * 0.6;
  ctx.textAlign = 'center';
  for (let i = 0; i < n; i++) {
    const cx = x0 + slot * (i + 0.5);
    const bareMs = p.bare[i] * 1000;
    const ratio = bareMs / p.targetMs;
    const color = ratio > 2 ? TOKENS.errorStroke : ratio > 1.3 ? TOKENS.warnStroke : TOKENS.okStroke;
    // bare bar
    ctx.fillStyle = p.showTreated ? TOKENS.surface3 : color;
    ctx.fillRect(cx - bw / 2, yOf(bareMs), bw, y1 - yOf(bareMs));
    // treated overlay
    if (p.showTreated) {
      const tMs = p.treated[i] * 1000;
      const tRatio = tMs / p.targetMs;
      ctx.fillStyle = tRatio > 2 ? TOKENS.errorStroke : tRatio > 1.3 ? TOKENS.warnStroke : TOKENS.okStroke;
      ctx.fillRect(cx - bw / 2, yOf(tMs), bw, y1 - yOf(tMs));
    }
    ctx.fillStyle = TOKENS.text4;
    ctx.fillText(OCTAVE_BANDS[i] >= 1000 ? `${OCTAVE_BANDS[i] / 1000}k` : `${OCTAVE_BANDS[i]}`, cx, y1 + 12);
  }

  // target line
  const ty = yOf(p.targetMs);
  ctx.strokeStyle = TOKENS.gold;
  ctx.setLineDash([5, 4]);
  ctx.beginPath(); ctx.moveTo(x0, ty); ctx.lineTo(x1, ty); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = TOKENS.gold;
  ctx.textAlign = 'left';
  ctx.fillText(`alvo ${p.targetMs}ms`, x0 + 2, ty - 3);
}
