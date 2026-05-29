import type { CanvasSize } from '../types';
import { TOKENS } from '../../theme/tokens';

export interface Plot {
  x0: number; y0: number; x1: number; y1: number; // pixel bounds (top-left origin)
}

export function plotArea(size: CanvasSize, pad = { l: 34, r: 10, t: 12, b: 22 }): Plot {
  return { x0: pad.l, y0: pad.t, x1: size.width - pad.r, y1: size.height - pad.b };
}

const LOG_MIN = 20;
const LOG_MAX = 20000;

export function xLog(f: number, p: Plot): number {
  const t = (Math.log10(f) - Math.log10(LOG_MIN)) / (Math.log10(LOG_MAX) - Math.log10(LOG_MIN));
  return p.x0 + t * (p.x1 - p.x0);
}

/** Log frequency grid with decade labels (20Hz–20kHz). */
export function drawFreqGrid(ctx: CanvasRenderingContext2D, p: Plot): void {
  ctx.font = '9px system-ui';
  ctx.textAlign = 'center';
  const marks = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
  for (const f of marks) {
    const x = xLog(f, p);
    ctx.strokeStyle = TOKENS.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, p.y0);
    ctx.lineTo(x, p.y1);
    ctx.stroke();
    ctx.fillStyle = TOKENS.text4;
    ctx.fillText(f >= 1000 ? `${f / 1000}k` : `${f}`, x, p.y1 + 12);
  }
}

/** Horizontal dB grid between dbMin..dbMax with labels. */
export function drawDbGrid(
  ctx: CanvasRenderingContext2D,
  p: Plot,
  dbMin: number,
  dbMax: number,
  step = 6,
): (db: number) => number {
  const yOf = (db: number) => p.y1 - ((db - dbMin) / (dbMax - dbMin)) * (p.y1 - p.y0);
  ctx.font = '9px system-ui';
  ctx.textAlign = 'right';
  for (let db = dbMin; db <= dbMax; db += step) {
    const y = yOf(db);
    ctx.strokeStyle = db === 0 ? TOKENS.gridStrong : TOKENS.grid;
    ctx.setLineDash(db === 0 ? [3, 3] : []);
    ctx.beginPath();
    ctx.moveTo(p.x0, y);
    ctx.lineTo(p.x1, y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = TOKENS.text4;
    ctx.fillText(`${db}`, p.x0 - 4, y + 3);
  }
  return yOf;
}
